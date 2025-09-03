"use server";

import { checkDrugInteractions, DrugInteractionCheckerOutput } from "@/ai/flows/drug-interaction-checker";
import { z } from "zod";

const schema = z.object({
  drugName: z.string().min(1, { message: "Please enter a drug name." }),
});

type State = {
  result: DrugInteractionCheckerOutput | null;
  error: string | null;
}

export async function getDrugInteractions(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = schema.safeParse({
    drugName: formData.get("drugName"),
  });

  if (!validatedFields.success) {
    return {
        result: null,
        error: validatedFields.error.flatten().fieldErrors.drugName?.join(", ") || 'Invalid input.'
    };
  }

  try {
    const result = await checkDrugInteractions({ drugName: validatedFields.data.drugName });
    return { result, error: null };
  } catch (e: any) {
    return { result: null, error: e.message || "An unexpected error occurred." };
  }
}
