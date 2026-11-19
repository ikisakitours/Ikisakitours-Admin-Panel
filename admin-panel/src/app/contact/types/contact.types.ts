export type ContactStatus = "pending" | "contacted" | "completed" | string;

export interface ContactInquiry {
  id: string;
  inquiryType: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  tourInterest?: string;
  status: ContactStatus;
  date?: string;
  createdAt: string;
  updatedAt?: string;
}
