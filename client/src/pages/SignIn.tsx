import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "../components/Input";
import OtpButton from "../components/Otp";
import { Link, useNavigate } from "react-router-dom";
import GoogleBtn from "../components/GoogleBtn";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Form = z.infer<typeof schema>;

export default function SignIn() {
  const nav = useNavigate();
  const { register, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  // Watch email field for OTP button
  const email = watch("email");

  function handleOtpSent() {
    nav("/verify");
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 px-4 md:px-10">
      <div className="max-w-md mx-auto w-full">
        {/* Logo at the top */}
        <div className="flex items-center justify-center mt-6">
          <img src="/assets/top.jpg" alt="HD Logo" className="h-12 w-12 mr-2" />
          
        </div>

        <h1 className="text-4xl font-bold mt-6">Sign in</h1>
        <p className="text-gray-500 mb-6">Please sign in to your account</p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />

          {/* OTP Button */}
          <OtpButton
            values={{ email, name: "User", purpose: "login" }}
            onOtpSent={handleOtpSent}
          />
        </form>

        <div className="my-4 text-center text-sm text-gray-500">or</div>
        <GoogleBtn />

        <p className="mt-6 text-sm text-gray-600">
          Need an account?{" "}
          <Link className="text-blue-600" to="/signup">
            Create one
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
