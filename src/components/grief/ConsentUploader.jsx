
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';
import { UploadFile } from "@/integrations/Core";
import { ConsentRecord } from "@/entities/all"; // Added ConsentRecord
import { Upload, FileCheck, Loader2, FileText, CheckCircle } from "lucide-react";

export default function ConsentUploader({ supportCoachId, onComplete }) {
    const [authorityType, setAuthorityType] = useState("");
    const [relationship, setRelationship] = useState(""); // Renamed from relationshipToDeceased
    const [subjectName, setSubjectName] = useState(""); // New state
    const [requesterName, setRequesterName] = useState(""); // Renamed from fullName
    const [requesterEmail, setRequesterEmail] = useState(""); // New state
    const [requesterPhone, setRequesterPhone] = useState(""); // New state

    const [agreedToTerms, setAgreedToTerms] = useState(false);
    // const [parentalConsent, setParentalConsent] = useState(false); // Removed as per outline
    const [takesResponsibility, setTakesResponsibility] = useState(false);
    const [hasExecutorConsent, setHasExecutorConsent] = useState(false);

    const [idFile, setIdFile] = useState(null); // New state
    const [proofFile, setProofFile] = useState(null); // New state
    const [isUploading, setIsUploading] = useState(false); // New state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false); // New state

    const allChecksPassed =
        agreedToTerms &&
        takesResponsibility &&
        hasExecutorConsent &&
        authorityType &&
        subjectName.trim() &&
        requesterName.trim() &&
        requesterEmail.trim() &&
        idFile &&
        proofFile &&
        // Additional checks for FriendFamily type
        (authorityType !== 'FriendFamily' || (relationship.trim()));


    const handleFileUpload = async (file, type) => {
        if (!file) return;
        setIsUploading(true); // Assuming this covers both uploads, might need to be more granular for UX
        try {
            const { file_url } = await UploadFile({ file });
            const fileData = { url: file_url, filename: file.name, type: type, uploaded_at: new Date().toISOString() };
            if (type === 'id_verification') {
                setIdFile(fileData);
            } else if (type === 'proof_of_authority') {
                setProofFile(fileData);
            }
        } catch (error) {
            console.error("File upload failed", error);
            alert("File upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!allChecksPassed) {
            alert("Please complete all required fields and upload all necessary documents.");
            return;
        }
        setIsSubmitting(true);
        try {
            await ConsentRecord.create({
                support_coach_id: supportCoachId,
                subject_full_name: subjectName,
                requester_full_name: requesterName,
                contact_email: requesterEmail,
                contact_phone: requesterPhone,
                authority_type: authorityType,
                relationship_to_deceased: relationship,
                agreed_to_terms: agreedToTerms,
                takes_responsibility: takesResponsibility,
                has_executor_consent: hasExecutorConsent,
                documents: [idFile, proofFile],
                status: 'pending'
            });
            setIsComplete(true);
            onComplete();
        } catch (error) {
            console.error("Failed to submit consent record", error);
            alert("There was an error submitting your consent form. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isComplete) {
        return (
            <div className="flex justify-center items-center min-h-screen p-6 bg-gray-50">
                <Card className="max-w-2xl w-full bg-white/80 backdrop-blur-sm border-0 shadow-xl p-8 text-center">
                    <CardHeader>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <CardTitle className="text-3xl font-bold text-green-700">Consent Form Submitted!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-lg text-gray-700">
                            Thank you for submitting the consent form. Your documents are now under review by our admin team.
                        </p>
                        <p className="text-md text-gray-600">
                            You will receive an email notification regarding the verification status within 24-48 hours.
                        </p>
                        <Button onClick={onComplete} className="mt-6 bg-green-600 hover:bg-green-700 text-white">
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen p-6 bg-gray-50">
            <Card className="max-w-2xl w-full bg-white/80 backdrop-blur-sm border-0 shadow-xl p-8">
                <CardHeader className="text-center">
                    <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <CardTitle className="text-2xl font-bold">Voice Cloning Consent</CardTitle>
                    <p className="text-gray-600 mt-2">
                        To clone a voice, we require explicit consent and proper authorization. This ensures ethical use and respects the memory of your loved one.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            Your documents will be reviewed by our admin team. You'll be notified via email once verification is complete (typically 24-48 hours).
                        </AlertDescription>
                    </Alert>

                    <Card className="bg-amber-50 border-2 border-amber-300">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <Shield className="w-8 h-8 text-amber-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-amber-900 mb-2">Voice Cloning Safeguards</h3>
                                    <p className="text-sm text-amber-800 mb-3">
                                        Helper33 requires proper authorization to prevent misuse. All voice clones are watermarked and restricted to therapeutic use only.
                                    </p>
                                    <p className="text-sm text-amber-800">
                                        <strong>Questions?</strong> Contact us at{' '}
                                        <a href="mailto:support@helper33.com" className="underline font-semibold">
                                            support@helper33.com
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        <Label htmlFor="subjectName">Full Name of the Individual to be Cloned *</Label>
                        <Input
                            id="subjectName"
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            placeholder="e.g., John Doe"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="requesterName">Your Full Name (Requester, as per ID) *</Label>
                        <Input
                            id="requesterName"
                            value={requesterName}
                            onChange={(e) => setRequesterName(e.target.value)}
                            placeholder="e.g., Jane Smith"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="requesterEmail">Your Email *</Label>
                        <Input
                            id="requesterEmail"
                            type="email"
                            value={requesterEmail}
                            onChange={(e) => setRequesterEmail(e.target.value)}
                            placeholder="e.g., jane.smith@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="requesterPhone">Your Phone Number (Optional)</Label>
                        <Input
                            id="requesterPhone"
                            type="tel"
                            value={requesterPhone}
                            onChange={(e) => setRequesterPhone(e.target.value)}
                            placeholder="e.g., +1 (555) 123-4567"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="authorityType">Your Legal Authority *</Label>
                        <Select onValueChange={setAuthorityType} value={authorityType}>
                            <SelectTrigger id="authorityType">
                                <SelectValue placeholder="Select your authority..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EstateAdmin">I am the estate administrator/executor</SelectItem>
                                <SelectItem value="Self">I am the individual (for self-cloning)</SelectItem>
                                <SelectItem value="LegalGuardian">I am the legal guardian (for minor/incapacitated individual)</SelectItem>
                                <SelectItem value="FriendFamily">I am a friend/family member with proper consent</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                            Choose "Friend/Family" if you have consent from the estate executor or have completed the DobryLife verification form.
                        </p>
                    </div>

                    {authorityType === 'FriendFamily' && (
                        <>
                            <div className="space-y-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <Label htmlFor="relationship">Your Relationship to the Deceased *</Label>
                                <Input
                                    id="relationship"
                                    value={relationship}
                                    onChange={(e) => setRelationship(e.target.value)}
                                    placeholder="e.g., close friend, cousin, colleague"
                                    required
                                />
                            </div>

                            <div className="flex items-start space-x-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <Checkbox
                                    id="executorConsent"
                                    checked={hasExecutorConsent}
                                    onCheckedChange={setHasExecutorConsent}
                                    required
                                />
                                <label
                                    htmlFor="executorConsent"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I confirm that I have obtained consent from the estate executor/administrator OR I have completed the DobryLife verification form and will upload the death certificate received from the family. *
                                </label>
                            </div>

                            <div className="flex items-start space-x-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <Checkbox
                                    id="takesResponsibility"
                                    checked={takesResponsibility}
                                    onCheckedChange={setTakesResponsibility}
                                    required
                                />
                                <label
                                    htmlFor="takesResponsibility"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    I agree to take full responsibility for the creation and use of this AI voice clone. I understand that I am legally and ethically responsible for its appropriate use. *
                                </label>
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="idVerification">Upload ID Verification (e.g., Driver's License, Passport) *</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                id="idVerification"
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload(e.target.files[0], 'id_verification')}
                                className="flex-grow"
                            />
                            {idFile ? <FileCheck className="text-green-500" /> : <Upload className="text-gray-400" />}
                        </div>
                        {idFile && (
                            <p className="text-sm text-gray-600 flex items-center space-x-1">
                                <FileText className="h-4 w-4" /> <span>{idFile.filename} uploaded.</span>
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="proofOfAuthority">Upload Proof of Authority (e.g., Death Certificate, Legal Document, DobryLife form) *</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                id="proofOfAuthority"
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload(e.target.files[0], 'proof_of_authority')}
                                className="flex-grow"
                            />
                            {proofFile ? <FileCheck className="text-green-500" /> : <Upload className="text-gray-400" />}
                        </div>
                        {proofFile && (
                            <p className="text-sm text-gray-600 flex items-center space-x-1">
                                <FileText className="h-4 w-4" /> <span>{proofFile.filename} uploaded.</span>
                            </p>
                        )}
                    </div>

                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="agreedToTerms"
                            checked={agreedToTerms}
                            onCheckedChange={setAgreedToTerms}
                            required
                        />
                        <label
                            htmlFor="agreedToTerms"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            I confirm that I have the legal authority and proper authorization to create a synthetic voice profile of the individual for my personal use. I understand this is an AI simulation and not the actual person. *
                        </label>
                    </div>

                    {/* Parental Consent checkbox removed as per outline */}

                    <Button
                        onClick={handleSubmit}
                        disabled={!allChecksPassed || isSubmitting || isUploading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting Consent...
                            </>
                        ) : (
                            "Submit Consent & Continue"
                        )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                        * Required fields. By submitting, you agree to our terms of service regarding voice synthesis, personal data use, and ethical AI practices.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
