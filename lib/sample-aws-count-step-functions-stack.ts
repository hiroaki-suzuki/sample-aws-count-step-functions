import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Choice,
  Condition,
  DefinitionBody,
  JsonPath,
  Pass,
  StateMachine,
  Succeed,
  Wait,
  WaitTime
} from "aws-cdk-lib/aws-stepfunctions";

export interface SampleAwsCountStepFunctionsStackProps extends cdk.StackProps {
  readonly namePrefix: string;
}

export class SampleAwsCountStepFunctionsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SampleAwsCountStepFunctionsStackProps) {
    super(scope, id, props);

    const { namePrefix } = props;

    const initializeCounter = this.createInitializeCounter();
    const incrementCounter = this.createIncrementCounter();
    const wait = this.createWait();
    const shouldContinue = this.createShouldContinue(wait, incrementCounter);
    const definitionBody =
      DefinitionBody.fromChainable(initializeCounter.next(incrementCounter).next(shouldContinue));

    new StateMachine(this, "StateMachine", {
      stateMachineName: `${namePrefix}-state-machine`,
      definitionBody,
      tracingEnabled: true
    });
  }

  private createInitializeCounter(): Pass {
    const stateName = "InitializeCounter";
    return new Pass(this, stateName, {
      stateName,
      parameters: {
        count: 0
      }
    });
  }

  private createIncrementCounter(): Pass {
    const stateName = "IncrementCounter";
    return new Pass(this, stateName, {
      stateName,
      parameters: {
        count: JsonPath.mathAdd(JsonPath.numberAt("$.count"), 1)
      }
    });
  }

  private createWait(): Wait {
    const stateName = "Wait";
    return new Wait(this, stateName, {
      stateName,
      time: WaitTime.duration(cdk.Duration.seconds(10))
    });
  }

  private createShouldContinue(wait: Wait, incrementCounter: Pass): Choice {
    const stateName = "HandleContinue";
    const succeed = new Succeed(this, `${stateName}Succeed`, { stateName: "Succeed" });

    return new Choice(this, stateName, {
      stateName
    }).when(
      Condition.numberLessThanEquals("$.count", 3),
      wait.next(incrementCounter)
    ).otherwise(succeed);
  }
}
