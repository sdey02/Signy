'use client';

import * as React from 'react';
import { X, Copy, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@/lib/supabase';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  fileName: string;
}

const EXPIRY_OPTIONS = [
  { value: '1', label: '1 day' },
  { value: '7', label: '7 days' },
  { value: '15', label: '15 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
];

export function ShareModal({ isOpen, onClose, documentId, fileName }: ShareModalProps) {
  const [email, setEmail] = React.useState('');
  const [accessLink, setAccessLink] = React.useState('');
  const [expiryDays, setExpiryDays] = React.useState('15');
  const [isGeneratingLink, setIsGeneratingLink] = React.useState(false);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  const { toast } = useToast();
  const supabase = createBrowserClient();

  const generateAccessLink = async () => {
    setIsGeneratingLink(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      const accessToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays)); 

      const { data: shareData, error: shareError } = await supabase
        .from('file_shares')
        .insert({
          document_id: documentId,
          shared_by: user.id,
          access_token: accessToken,
          expires_at: expiryDate.toISOString(),
        })
        .select()
        .single();

      if (shareError) throw shareError;

      const link = `${window.location.origin}/share/${accessToken}`;
      setAccessLink(link);
      
      toast({
        description: "Share link has been generated and copied to clipboard",
        className: "bg-[#1a1a1a] text-white border border-[#333]",
      });
      
      navigator.clipboard.writeText(link);
    } catch (error: any) {
      toast({
        description: error.message || "Failed to generate share link",
        variant: "destructive",
        className: "bg-[#1a1a1a] text-red-400 border border-red-500/50",
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const sendEmailInvite = async () => {
    if (!email) return;
    
    setIsSendingEmail(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      const accessToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));

      const { error: shareError } = await supabase
        .from('file_shares')
        .insert({
          document_id: documentId,
          shared_by: user.id,
          shared_with: email,
          access_token: accessToken,
          expires_at: expiryDate.toISOString(),
        });

      if (shareError) throw shareError;

      toast({
        description: `An invitation has been sent to ${email}`,
        className: "bg-[#1a1a1a] text-white border border-[#333]",
      });
      
      setEmail('');
    } catch (error: any) {
      toast({
        description: error.message || "Failed to send invitation",
        variant: "destructive",
        className: "bg-[#1a1a1a] text-red-400 border border-red-500/50",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(accessLink);
    toast({
      description: "Link copied to clipboard",
      className: "bg-[#1a1a1a] text-white border border-[#333]",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-[#333] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Share "{fileName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-200">Email invitation</h3>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-[#121212] border-[#333] text-white placeholder:text-gray-400"
              />
              <Button
                onClick={sendEmailInvite}
                disabled={!email || isSendingEmail}
                className="bg-[#edb5b5] text-black hover:bg-[#f2c4c4]"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email link
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-200">Share link</h3>
              <div className="flex items-center gap-2">
                <Select
                  value={expiryDays}
                  onValueChange={setExpiryDays}
                >
                  <SelectTrigger className="w-[120px] bg-[#121212] border-[#333] text-white">
                    <SelectValue placeholder="Expires in" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#333] text-white">
                    {EXPIRY_OPTIONS.map(option => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="hover:bg-[#333] focus:bg-[#333] focus:text-white"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAccessLink}
                  disabled={isGeneratingLink}
                  className="border-[#333] text-white hover:bg-[#333]"
                >
                  Generate link
                </Button>
              </div>
            </div>
            {accessLink && (
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={accessLink}
                  className="flex-1 bg-[#121212] border-[#333] text-white"
                />
                <Button
                  variant="outline"
                  className="border-[#333] text-white hover:bg-[#333]"
                  onClick={handleCopyLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-sm text-gray-400">
              Generate a unique link you can share. This link will expire in {expiryDays} days.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 