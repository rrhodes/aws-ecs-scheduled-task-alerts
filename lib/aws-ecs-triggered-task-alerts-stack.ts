import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Schedule } from 'aws-cdk-lib/aws-applicationautoscaling';
import { Cluster, ContainerImage, FargatePlatformVersion, FargateTaskDefinition, LogDrivers } from 'aws-cdk-lib/aws-ecs';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { ScheduledFargateTask } from 'aws-cdk-lib/aws-ecs-patterns';
import { Rule } from 'aws-cdk-lib/aws-events';
import { ManagedPolicy, ServicePrincipal, Role } from 'aws-cdk-lib/aws-iam';

export class AwsEcsTriggeredTaskAlertsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cluster = new Cluster(this, 'Cluster', {
      clusterName: 'fargate-cluster-example',
      containerInsights: false,
      enableFargateCapacityProviders: true,
    });

    const taskExecutionPolicy = ManagedPolicy.fromAwsManagedPolicyName(
      'service-role/AmazonECSTaskExecutionRolePolicy'
    );

    const ecsServicePrincipal = new ServicePrincipal('ecs-tasks.amazonaws.com');

    const taskExecutionRole = new Role(this, 'TaskExecutionRole', {
      assumedBy: ecsServicePrincipal,
      managedPolicies: [taskExecutionPolicy],
    });

    const taskFamily = 'fargate-task-definition-example';

    const taskDefinition = new FargateTaskDefinition(this, 'TaskDefinition', {
      executionRole: taskExecutionRole,
      family: taskFamily,
    });

    const dockerImageAsset = new DockerImageAsset(this, 'DockerImageAsset', {
        directory: '.',
    });

    taskDefinition.addContainer('Container', {
      image: ContainerImage.fromDockerImageAsset(dockerImageAsset),
      logging: LogDrivers.awsLogs({ streamPrefix: taskFamily })
    });

    new ScheduledFargateTask(this, 'ScheduledFargateTask', {
      cluster,
      scheduledFargateTaskDefinitionOptions: { taskDefinition },
      schedule: Schedule.cron({ minute: '0/1' }), // trigger task every minute
      platformVersion: FargatePlatformVersion.LATEST,
    });

    new Rule(this, 'TaskExitedRule', {
      description: 'Rule for events indicating an ECS task exited with one of a specified list of exit codes.',
      eventPattern: {
        detail: {
          clusterArn: [cluster.clusterArn],
          containers: {
            exitCode: [
              1,
              137,
              139,
              255
            ],
          },
          lastStatus: ['STOPPED'],
          stoppedReason: ['Essential container in task exited'],
          taskDefinitionArn: [taskDefinition.taskDefinitionArn],
        },
        detailType: ['ECS Task State Change'],
        source: ['aws.ecs'],
      },
    });
  }
}
