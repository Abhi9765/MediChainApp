"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDrugInteractions } from "@/lib/actions";
import { AlertCircle, Bot, ListChecks, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState = {
  result: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Checking...
        </>
      ) : (
        "Check Interactions"
      )}
    </Button>
  );
}

export default function DrugInteractionPage() {
  const [state, formAction] = useFormState(getDrugInteractions, initialState);

  return (
    <div className="flex justify-center items-start pt-10">
      <Card className="w-full max-w-2xl">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6" />
                AI Drug Interaction Checker
            </CardTitle>
            <CardDescription>
              Enter a drug name to check for potential interactions. This tool is
              for informational purposes only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="drugName">Drug Name <span className="text-destructive">*</span></Label>
              <Input
                id="drugName"
                name="drugName"
                placeholder="e.g., Aspirin"
                required
              />
            </div>
            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>

        {state?.result && (
          <CardContent>
            <Alert>
              <ListChecks className="h-4 w-4" />
              <AlertTitle>Potential Interactions Found</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {state.result.interactions.map((interaction, index) => (
                    <li key={index}>{interaction}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
        
        {state?.result?.interactions?.length === 0 && (
             <CardContent>
                <Alert variant="default">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Interactions Found</AlertTitle>
                    <AlertDescription>
                        The AI model did not find any potential interactions for the specified drug. Always consult a healthcare professional.
                    </AlertDescription>
                </Alert>
             </CardContent>
        )}
      </Card>
    </div>
  );
}
