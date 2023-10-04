import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import * as cloudfront from "aws-cdk-lib/aws-cloudfront"
import * as iam from "aws-cdk-lib/aws-iam"
import * as s3 from "aws-cdk-lib/aws-s3"
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment"
import * as route53 from "aws-cdk-lib/aws-route53"
import * as targets from "aws-cdk-lib/aws-route53-targets"
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager"

interface CloudfrontStackProps extends cdk.StackProps {
  hostName: string
  domainName: string
  certificate: certificatemanager.Certificate
}

export class CloudfrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CloudfrontStackProps) {
    super(scope, id, props)

    // Create Bucket
    const myBucket = new s3.Bucket(this, "my-bucket", {
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
    new s3deploy.BucketDeployment(this, "BucketDeploy", {
      destinationBucket: myBucket,
      sources: [s3deploy.Source.asset("./lib/s3")],
      retainOnDelete: false,
    })

    // Create OriginAccessIdentity
    const oai = new cloudfront.OriginAccessIdentity(this, "my-oai")

    // Create Policy and attach to mybucket
    const myBucketPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:GetObject"],
      principals: [
        new iam.CanonicalUserPrincipal(
          oai.cloudFrontOriginAccessIdentityS3CanonicalUserId,
        ),
      ],
      resources: [myBucket.bucketArn + "/*"],
    })
    myBucket.addToResourcePolicy(myBucketPolicy)

    // Create CloudFront WebDistribution
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "WebsiteDistribution",
      {
        viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
          props.certificate,
          {
            aliases: [`${props.hostName}.${props.domainName}`],
          },
        ),
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: myBucket,
              originAccessIdentity: oai,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
        errorConfigurations: [
          {
            errorCode: 403,
            responsePagePath: "/index.html",
            responseCode: 200,
            errorCachingMinTtl: 0,
          },
          {
            errorCode: 404,
            responsePagePath: "/index.html",
            responseCode: 200,
            errorCachingMinTtl: 0,
          },
        ],
      },
    )

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.domainName,
    })

    new route53.ARecord(this, "CloudFrontRecord", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution),
      ),
      recordName: props.hostName,
    })
  }
}
