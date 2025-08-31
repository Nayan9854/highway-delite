import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../components/Input";
import Button from "../components/Button";
import { api } from "../api";
import { useNavigate, Link } from "react-router-dom";

const schema = z.object({ otp: z.string().min(6).max(6, "6-digit OTP") });

type Form = z.infer<typeof schema>;

export default function VerifyOtp() {
  const nav = useNavigate();
  const prefill = JSON.parse(sessionStorage.getItem("prefill") || "{}");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: Form) {
    try {
      const { data } = await api.post("/api/auth/verify-otp", { ...prefill, otp: values.otp });
      localStorage.setItem("user", JSON.stringify(data.user));
      nav("/dashboard");
    } catch (e: any) {
      alert(e.response?.data?.message || "OTP verification failed");
    }
  }

  if (!prefill?.email) {
    return (
      <div className="p-6">
        No signup data.{" "}
        <Link className="text-blue-600" to="/signup">
          Start again
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 px-4 md:px-10">
      <div className="max-w-md mx-auto w-full">
        {/* Logo at the top */}
        <div className="flex items-center justify-center mt-6">
          <img src="/assets/top.jpg" alt="HD Logo" className="h-12 w-12 mr-2" />
        
        </div>

        <h1 className="text-4xl font-bold mt-6">Sign up</h1>
        <p className="text-gray-500 mb-6">
          Enter the OTP sent to <b>{prefill.email}</b>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="OTP"
            placeholder="______"
            {...register("otp")}
            error={errors.otp?.message}
          />
          <Button disabled={isSubmitting}>Sign up</Button>
        </form>

        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link className="text-blue-600" to="/signin">
            Sign in
          </Link>
        </p>
      </div>

      <div className="hidden md:flex items-center justify-center">
        <img
          src="/assets/hero.jpg"
          className="rounded-3xl w-[560px] h-[560px] object-cover"
        />
      </div>
    </div>
  );
}
