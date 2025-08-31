import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "../components/Input";
import OtpButton from "../components/Otp"; // make sure this path matches your OtpButton file
import { Link, useNavigate } from "react-router-dom";
import GoogleBtn from "../components/GoogleBtn";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  dob: z.string().optional(),
  email: z.string().email("Enter a valid email"),
});
type Form = z.infer<typeof schema>;

export default function SignUp() {
  const nav = useNavigate();
  const { register, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const name = watch("name");
  const dob = watch("dob");
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

        <h1 className="text-4xl font-bold mt-6">Sign up</h1>
        <p className="text-gray-500 mb-6">Sign up to enjoy the feature of HD</p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Input
            label="Your Name"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Date of Birth"
            type="date"
            {...register("dob")}
          />
          <Input
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />

          {/* OTP Button */}
          <OtpButton
            values={{ name, dob, email, purpose: "signup" }}
            onOtpSent={handleOtpSent}
          />
        </form>

        <div className="my-4 text-center text-sm text-gray-500">or</div>
        <GoogleBtn />

        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link className="text-blue-600" to="/signin">
            Sign in
          </Link>
        </p>
      </div>

      {/* Right side image */}
      <div className="hidden md:flex items-center justify-center">
        <img
          src="/assets/hero.jpg"
          className="rounded-3xl w-[560px] h-[560px] object-cover"
        />
      </div>
    </div>
  );
}
