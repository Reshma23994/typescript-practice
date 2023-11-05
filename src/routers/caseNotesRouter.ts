import * as express from "express";
import * as caseNoteCntrls from "../controllers/caseNotes.controller";
//import { CaseNoteSummay } from "../models/caseNotes.controller" 
const optimusRouter=express.Router();
optimusRouter.put("/notes",async (req,res)=>{
    try{
        console.log("---request---" + JSON.stringify(req.body.details));
        const jsonData = req.body.details;
        if (jsonData.hasOwnProperty("status")){
            if (jsonData.status == "resolved" && !(jsonData.hasOwnProperty("endDate"))){
                throw new Error("invalid request, end date is mandatory");
            }
        }
        else{
            jsonData.status="pending";
        }

        if (jsonData.hasOwnProperty("startDate")){
            const startDate=new Date(jsonData.startDate);
            jsonData.startDate=startDate;
        }
        else{
            jsonData.startDate=new Date();
        }
        
        const adminId = await caseNoteCntrls.findAdmin(jsonData.adminEmail);
        const userId = await caseNoteCntrls.createUser(jsonData);
        jsonData.createdBy = adminId;
        jsonData.userId = userId;
        console.log("---request formed---" + JSON.stringify(jsonData));
        const caseNoteObj = await caseNoteCntrls.createNewCaseNote(jsonData);
       
        
        
        res.send("inserted new case note" + JSON.stringify(caseNoteObj));
    }
    catch(error){
        console.log("error " + error);
        res.send(error);
    }
     
});

optimusRouter.patch("/notes",async(req,res)=>{
    try{
        const jsonData=req.body.details;
        const updatedCaseNote = await caseNoteCntrls.editNotes(jsonData);
        res.send(updatedCaseNote);
    }
    catch(error){
        console.log(error);
    }
});

optimusRouter.post("/notes/status", async (req, res) => {
    try {
        const jsonData = req.body.details;
        const updateStatus = await caseNoteCntrls.updateStatus(jsonData);
        res.send(updateStatus);
    }
    catch (error) {
        console.log(error);
    }
});

optimusRouter.delete("/notes/:id", async (req, res) => {
    try {
        if (req.query.id){

            const caseNoteId = req.params.id;
            const jsonData=req.body.details;
            const deleteCaseNoteObj = await caseNoteCntrls.deleteCaseNotes(jsonData, caseNoteId);
            res.send(deleteCaseNoteObj);
        }
        else{
            res.send("invalid url");
        }
        
    }
    catch (error) {
        console.log(error);
    }
});

// optimusRouter.get("/notes", async (req, res) => {
//     try {
//         let listCaseNotesObj;
//         console.log("req.query " + JSON.stringify(req.query));
//         if(req.query.status){
//             console.log("req.query.status---" + req.query.status);
//             const status=req.query.status;
//             listCaseNotesObj = await caseNoteCntrls.listCaseNoteSummary(status);
//         }
//         else{
//             listCaseNotesObj = await caseNoteCntrls.listCaseNoteSummary();
//         }
//         res.send(listCaseNotesObj);
        
//     }
//     catch (error) {
//         console.log("error " + error);
//         res.send(error);
//     }

// });

optimusRouter.get("/notes", async (req, res) => {
    try {
        let listCaseNotesObj;
        console.log("req.query " + JSON.stringify(req.query));
        if (Object.keys(req.query).length==0){
            listCaseNotesObj = await caseNoteCntrls.listCaseNoteSummary();
        }
        else{
            listCaseNotesObj = await caseNoteCntrls.listCaseNoteSummary(req.query);
        }
        res.send(listCaseNotesObj);
        
    }
    catch (error) {
        console.log("error " + error);
        res.send(error);
    }

});
export default optimusRouter;