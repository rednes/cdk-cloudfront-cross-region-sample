import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import * as route53 from "aws-cdk-lib/aws-route53"
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager"

interface AcmForCloudfrontStackProps extends cdk.StackProps {
  hostName: string
  domainName: string
}

export class AcmForCloudfrontStack extends cdk.Stack {
  public readonly certificate: certificatemanager.Certificate

  constructor(scope: Construct, id: string, props: AcmForCloudfrontStackProps) {
    super(scope, id, props)

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.domainName,
    })

    this.certificate = new certificatemanager.Certificate(this, "Certificate", {
      domainName: `${props.hostName}.${props.domainName}`,
      validation: certificatemanager.CertificateValidation.fromDns(hostedZone),
    })
  }
}
