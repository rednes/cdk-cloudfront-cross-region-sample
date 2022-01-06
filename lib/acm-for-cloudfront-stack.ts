import { Construct } from 'constructs'
import {
    Stack,
    StackProps,
    CfnOutput,
} from 'aws-cdk-lib'
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';

interface AcmForCloudfrontStackProps extends StackProps {
    hostName: string
    domainName: string
}

export class AcmForCloudfrontStack extends Stack {
    constructor(scope: Construct, id: string, props: AcmForCloudfrontStackProps) {
        super(scope, id, props);

        const hostedZone = route53.HostedZone.fromLookup(
            this,
            'HostedZone',
            {
                domainName: props.domainName,
            }
        );

        const certificate = new certificatemanager.DnsValidatedCertificate(
            this,
            'Certificate',
            {
                domainName: `${props.hostName}.${props.domainName}`,
                hostedZone: hostedZone,
                validation:
                    certificatemanager.CertificateValidation.fromDns(hostedZone),
            }
        );

        new CfnOutput(this, 'AcmArn', {
            value: certificate.certificateArn,
        });
    }
}
