const AWS=require("aws-sdk")
const s3=require("../config/awsConfig")
AWS.config.update(s3)
let newInstance=new AWS.S3()

function isDirectoryAvailable(bucketName,folderPath){
    newInstance.headObject({ Bucket: bucketName, Key: folderPath }, function(err, data) {
        if (err && err.code === 'NotFound'){
            newInstance.putObject({Bucket: bucketName, Key: folderPath},(err,data)=>{
                if(err){
                console.log('Error in creating directory : ',err);
                return false
            }
                console.log(`Folder ${folderPath} created successfully.`);
                return true;
            })
        } 
        return false
    })

}
module.exports=isDirectoryAvailable;