import { ObjectID } from "bson";
import mongoose,{ Document,ObjectId,Types } from "mongoose";

export type Roles="operations" | "member" | "root"
export type Status="pending"| "rejected" | "resolved" | "inactive"
export type User = Document & {
    fullName: string,
    email: string,
   
}

export type CaseNoteSummary={
    caseNoteId: ObjectId,
    caseNote: string,
    status: Status,
    startDate: Date | string,
    endDate?:  Date | string,
    user: User,
    createdBy: Admin,
    editedBy?: Admin | string;
}

export type Admin = Document & {
    name: string,
    email: string,
    role?: [Roles]

}

export type CaseNotes = Document & {
    caseNote: string,
    status: Status,
	startDate: Date,
	endDate?: Date,
    createdBy: Types.ObjectId,
    userId: Types.ObjectId,
    editedBy?: Types.ObjectId
}
