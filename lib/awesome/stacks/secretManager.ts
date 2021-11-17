import cdk = require('@aws-cdk/core');
import ec2 = require('@aws-cdk/aws-ec2');
import secretManager =require('@aws-cdk/aws-secretsmanager')



export interface AwesomeSecretManagerStackProps extends cdk.StackProps{
org:string ,
enviroment:string
vpc : ec2.IVpc

}

export class AwesomeSecretManagerStack extends cdk.Stack
{
    public readonly vpc: ec2.Vpc

    constructor(scope: cdk.Construct , id:string , props: AwesomeSecretManagerStackProps){
        super(scope,id,props);


        const dbSecretManager =  new secretManager.Secret(this,`${props.org}-${props.enviroment}-secretManager`,{
            description: 'Secret for Aurora DataBase', 
            secretName: `${props.org}-${props.enviroment}-credential`,
            generateSecretString: {
                secretStringTemplate: JSON.stringify({
                    
                        "dbInstanceIdentifier": "system-settings",
                        "engine": "aurora",
                        "host": "system-settings.cluster-cd1va0apwf7u.us-east-1.rds.amazonaws.com",
                        "port": 3306,
                        "resourceId": "cluster-EI7FAJH5XFZ4K5RLCNFKNUVOCE",
                        "username": "admin",
                      
                      
                }),
                excludePunctuation:true,
                includeSpace:false,
                generateStringKey: 'password'
                
                
            }
                        
        })

        new cdk.CfnOutput(this,`${props.org}-${props.enviroment}-secretManagerOutPut`,{
            value : dbSecretManager.secretArn
        });


       
      
    }


    
}