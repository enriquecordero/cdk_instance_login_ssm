import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import { CfnOutput } from '@aws-cdk/core';


export interface AwesomeAppStackProps extends cdk.StackProps{
org:string ,
enviroment:string
vpc : ec2.IVpc
//sshKeyName: string
}

export class AwesomeAppStack extends cdk.Stack
{
    public readonly vpc: ec2.Vpc

    constructor(scope: cdk.Construct , id:string , props: AwesomeAppStackProps){
        super(scope,id,props);

       
        const securityGroup = new ec2.SecurityGroup(this,`${props.org}-${props.enviroment}-appSG`,{
            vpc: props.vpc,
            securityGroupName: 'AppServerSG',
            description: 'Allow ssh and web from anywhere',
            allowAllOutbound:true
        });
        // from 0.0.0.0/0 - cualquier ip   a 80
        //securityGroup.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(22),'allow public ssh access')
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(80),'allow public http access')
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(),ec2.Port.tcp(443),'allow public https access')

        const userData = ec2.UserData.forLinux();
        userData.addCommands('yum install -y nginx','chkconfig nginx on','service nginx start')

        // make sure the latest SSM Agent is installed.
        const SSM_AGENT_RPM = 'https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm';
        userData.addCommands(`yum install -y ${SSM_AGENT_RPM}`, 'restart amazon-ssm-agent');

        const role = new iam.Role(this, `${props.org}-${props.enviroment}-appServerRole`, {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
        });
    
        // define the IAM role that will allow the EC2 instance to communicate with SSM 
        role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

        const instance = new ec2.Instance(this,`${props.org}-${props.enviroment}-app`,{
            vpc: props.vpc,
            instanceType:  new ec2.InstanceType('t2.micro'),
            machineImage: new ec2.AmazonLinuxImage(),
            instanceName: 'App Server',
           // keyName:  props.sshKeyName,
            securityGroup:securityGroup,
            userData:userData,
            vpcSubnets : props.vpc.selectSubnets({
                subnetType: ec2.SubnetType.PUBLIC
            }),
            role:role
        });

        new CfnOutput(this,'Instance ID',{value : instance.instanceId})

        new CfnOutput(this,'Instance Public IP',{value : instance.instancePublicIp})


        new CfnOutput(this,'Instance Hostname',{value : instance.instancePublicDnsName})


    }


    
}