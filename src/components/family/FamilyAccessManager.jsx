import React, { useState } from 'react';
import { FamilyMember } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, Copy, Eye, EyeOff, RotateCw, Loader2 } from 'lucide-react';
import { toast } from "sonner";

const generateRandomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default function FamilyAccessManager({ members, onMemberUpdate }) {
  const [loadingMemberId, setLoadingMemberId] = useState(null);
  const [visibleCodeMemberId, setVisibleCodeMemberId] = useState(null);

  const handleGenerateCode = async (memberId) => {
    setLoadingMemberId(memberId);
    try {
      const newCode = generateRandomCode();
      await FamilyMember.update(memberId, { access_code: newCode });
      toast.success("New access code generated!");
      onMemberUpdate();
    } catch (error) {
      console.error("Error generating access code:", error);
      toast.error("Failed to generate code.");
    } finally {
      setLoadingMemberId(null);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  return (
    <Card data-card>
      <CardHeader>
        <CardTitle>Family Access & Security</CardTitle>
        <CardDescription>
          Generate and manage unique 6-digit codes for family members to access shared information, like the family schedule, without needing to log in. This is perfect for kids or caregivers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map(member => (
            <div key={member.id} className="p-4 bg-white/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-primary">{member.name}</p>
                <p className="text-sm text-secondary">{member.role}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {member.access_code ? (
                  <>
                    <div className="flex items-center gap-2 p-2 bg-slate-100 border rounded-md">
                      <KeyRound className="w-4 h-4 text-slate-500" />
                      <span className="font-mono text-slate-700 tracking-widest">
                        {visibleCodeMemberId === member.id ? member.access_code : '••••••'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setVisibleCodeMemberId(visibleCodeMemberId === member.id ? null : member.id)}
                    >
                      {visibleCodeMemberId === member.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(member.access_code)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleGenerateCode(member.id)} disabled={loadingMemberId === member.id}>
                      {loadingMemberId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
                      <span className="ml-2">Reset</span>
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => handleGenerateCode(member.id)} disabled={loadingMemberId === member.id}>
                    {loadingMemberId === member.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="mr-2 h-4 w-4" />
                    )}
                    Generate Code
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}