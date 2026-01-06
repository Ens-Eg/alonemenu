import { Suspense } from "react";
import ConfirmEmailForm from "@/components/Authentication/ConfirmEmailForm";
import DarkMode from "@/components/Authentication/DarkMode";

export default function Page() {
  return (
    <>
      <DarkMode />

      <Suspense fallback={<div>Loading...</div>}>
        <ConfirmEmailForm />
      </Suspense>
    </>
  );
}
