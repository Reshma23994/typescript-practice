import mongoose,{ Schema } from "mongoose";
import { User,Admin,CaseNotes } from "./Entity";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.MONGODB_URI_LOCAL);
mongoose.connect(process.env.MONGODB_URI_LOCAL + process.env.DB_NAME).then(()=>{
    console.log("connected to db");
}).catch(error =>{
    console.log("connection failed "+error);
});

const schemaUser: Schema = new Schema({
    fullName: String ,
    email: { type: String, unique: true, required: true }
});

const adminSchema:Schema = new Schema({
    name:  String ,
    email: { type: String, unique: true },
    role: { type: Array }

});

const caseNoteSchema: Schema = new Schema({
    caseNote: String,
    status: String,
    startDate: Date,
    endDate: Date,
    createdBy: { type: mongoose.Types.ObjectId },
    userId: { type: mongoose.Types.ObjectId },
});

export const UserModel=  mongoose.model<User>("User", schemaUser);
export const AdminModel = mongoose.model<Admin>("Admin", adminSchema);

export const CaseNoteModel = mongoose.model<CaseNotes>("CaseNotes", caseNoteSchema);

