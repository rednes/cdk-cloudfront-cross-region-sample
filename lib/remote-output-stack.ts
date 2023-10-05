import { RemoteOutputs } from "cdk-remote-stack"
import { App, Stack, StackProps } from "aws-cdk-lib"
import { AcmForCloudfrontStack } from "./acm-for-cloudfront-stack"

interface RemoteOutputStackProps extends StackProps {
  acm: AcmForCloudfrontStack
}

export class RemoteOutputStack extends Stack {
  public readonly acmArn: string

  constructor(scope: App, id: string, props: RemoteOutputStackProps) {
    super(scope, id, props)

    this.addDependency(props.acm)

    const outputs = new RemoteOutputs(this, "Outputs", {
      stack: props.acm,
      alwaysUpdate: false,
    })

    this.acmArn = outputs.get("AcmArn")
  }
}
