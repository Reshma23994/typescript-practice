import { UserModel, CaseNoteModel, AdminModel } from "../models/EntitySchema";
import { CaseNoteSummary, CaseNotes } from "../models/Entity";
import mongoose from "mongoose";
export async function createUser(jsonData: any) {  
    try{
        const userObj = await UserModel.findOne({ "email": jsonData.userEmail, "fullName": jsonData.name }).exec();
        console.log("userObj " + JSON.stringify(userObj));

        if (userObj) {
            return userObj._id;
        }
        else {
            const newUserOper = new UserModel({
                fullName: jsonData.name,
                email: jsonData.userEmail,

            });
            const resultant = await newUserOper.save();
            console.log("resultant " + JSON.stringify(resultant));
            return resultant._id;
        }
    }   
    catch (error){
        throw new Error(error);

    } 
    
}

export async function findAdmin(adminEmail: any) {
    const adminObj = await AdminModel.findOne({ "email": adminEmail }).exec();
    console.log("adminObj " + JSON.stringify(adminObj));
    if (adminObj) {

        return adminObj._id;
    }
    else {
        throw new Error("invalid request, enter valid admin");
    }
}


export async function createNewCaseNote(jsonData: any) {
    try{
        const caseNoteInsertObj = new CaseNoteModel({ ...jsonData });
        const caseNoteObj = await caseNoteInsertObj.save();
        return caseNoteObj;
    }
    catch(error){
        throw new Error(error);
    }
   
}
 async function getUserDetailsById(userId:any){
    try{
        const userObject = await UserModel.findOne({ "_id": userId }, { "_id": 0, "__v": 0 }).exec();
        return userObject;
    }
    catch(error){
        throw new Error(error);
    }
 }

async function getAdminDetailsById(adminId: any) {
    try {
        const adminObject = await AdminModel.findOne({ "_id": adminId }, { "_id": 0, "__v": 0,"role":0 }).exec();
        return adminObject;
    }
    catch (error) {
        throw new Error(error);
    }
}

// export async function listCaseNoteSummary(status?:any){
//     try{
//         let lstcaseNoteObj:CaseNotes[];
//         let lstCaseNoteSum: CaseNoteSummary[] = [];
//         if (typeof status !== "undefined") {
//             lstcaseNoteObj = await CaseNoteModel.find({ "status": status }, { "__v": 0 }).exec();
//         }
//         else {
//             lstcaseNoteObj = await CaseNoteModel.find({ "status": { $not: { $in: ["inactive"] } } }, {  "__v": 0 }).exec();
//         }

//         for (const caseNoteObject of lstcaseNoteObj  ){
//             const userObject = await getUserDetailsById(caseNoteObject.userId);
//             const adminObject = await getAdminDetailsById(caseNoteObject.createdBy);
//             let editedByObject = undefined;
//             if (caseNoteObject.editedBy) {
//                 editedByObject = await getAdminDetailsById(caseNoteObject.editedBy)
//             }
//             let caseNoteNode: CaseNoteSummary = {
//                 caseNoteId: caseNoteObject._id,
//                 caseNote: caseNoteObject.caseNote,
//                 status: caseNoteObject.status,
//                 startDate: caseNoteObject.startDate,
//                 endDate: caseNoteObject.endDate || "not available",
//                 user: userObject,
//                 createdBy: adminObject,
//                 editedBy: editedByObject || "Not edited yet"

//             };
//             lstCaseNoteSum.push(caseNoteNode)
//         }
        
//         return lstCaseNoteSum
//     }
//     catch(error){
//         throw new Error(error);
//     }
// }

export async function listCaseNoteSummary(filterData?: any) {
    try {
        let lstcaseNoteObj: CaseNotes[];
        let lstCaseNoteSum: CaseNoteSummary[] = [];
        var queryArray=[]
        if (filterData.userId){
            queryArray.push({ "userId": mongoose.Types.ObjectId(filterData.userId) })
        }
        if(filterData.status){
            queryArray.push({ "status": filterData.status })
        }
        if (filterData.startDate || filterData.endDate){
            let dateRange={}
            if (!filterData.startDate) {
                throw new Error("Invalid Request")
            }
            else if(!filterData.endDate){
                dateRange={
                    startDate: new Date(filterData.startDate)
                }
            }
            else{
                dateRange = {
                    startDate: {
                        $gte: new Date(filterData.startDate),
                        $lte: new Date(filterData.endDate)
                    }

                }
            }
            queryArray.push(dateRange)
            
        }
        let pipelineQuery = {}
        if (queryArray.length==1){
            pipelineQuery={
                $match: queryArray[0]
            }
        }
        else{
         pipelineQuery={
            $match:{
                 $and:queryArray
             }
         }
        }
        console.log(JSON.stringify(pipelineQuery))
        const aggregateResult = await CaseNoteModel.aggregate([pipelineQuery]).exec()
        return aggregateResult
    }
    catch (error) {
        throw new Error(error);
    }
}

async function validateUser(userName: any, email: any, caseNoteUserId:any) {
    console.log("userName " + userName + " email" + email)
    const userId = await UserModel.findOne({ "email": email, "fullName": userName },{"_id":1}).exec();
    console.log("userId "+userId)
    console.log("userId._id == caseNoteUserId.userId " + userId?._id +" "+caseNoteUserId.userId)
    if (String(userId?._id )== String(caseNoteUserId.userId)){
        console.log("user exists")
        return true
    }
    
    return false
}

async function validateAdminRights(adminEmail: any,access:any){
    console.log(adminEmail)
    const adminRoles = await AdminModel.findOne({ "email": adminEmail },{"role":1,"_id":0})
    if (adminRoles.role.includes(access)){
        console.log("true")
        return true
    }
    console.log("false")
    return false
}

export async function updateStatus(jsonData:any){
    try{
        console.log("adminEmail "+jsonData.adminEmail)
        const access="operations"
        const isValidAdminRights = await validateAdminRights(jsonData.adminEmail, access)
        if (isValidAdminRights){
            console.log("adminValid")
            const updateStatusObj = await CaseNoteModel.findByIdAndUpdate({"_id":jsonData.caseNoteId },{"status":jsonData.status}).exec()
            return updateStatusObj
        }
        else{
            throw new Error("Access denied")
        }
    }
    catch(error){
        throw new Error(error)
    }
}
export async function editNotes(jsonData:any){
  
   try{
       const caseNoteObject = await CaseNoteModel.findById({ "_id": jsonData.caseNoteId }, { "userId": 1,"status":1,"_id": 0 })
       console.log("caseNoteUserId " + caseNoteObject)
       const isUserValid = await validateUser(jsonData.fullName, jsonData.email, caseNoteObject)
       console.log("isUserValid " + isUserValid)
       if (caseNoteObject.status == "resolved"){
            return "Cannot edit resolved case note, contact admin"
       }
       else if (!isUserValid){
           return "Username does not match"
       }
       else{
           const caseNoteObject = await CaseNoteModel.updateOne({ "_id": jsonData.caseNoteId }, { caseNote: jsonData.newcaseNote }, {
               new: true
           }).exec();
           return (JSON.stringify(caseNoteObject));
       }
       
   }
   catch (error){
    console.log("editNotes "+error)
   }
   
    
}

export async function deleteCaseNotes(jsonData: any, caseNoteId:any) {
    try {
        console.log("adminEmail " + jsonData.adminEmail)
        const access = "root"
        const isValidAdminRights = await validateAdminRights(jsonData.adminEmail, access)
        if (isValidAdminRights) {
            console.log("adminValid")
            const deletCaseNoteObject = await CaseNoteModel.deleteOne({ "_id": caseNoteId }).exec()
            return deletCaseNoteObject
        }
        else {
            throw new Error("Access denied")
        }
    }
    catch (error) {
        throw new Error(error)
    }
}