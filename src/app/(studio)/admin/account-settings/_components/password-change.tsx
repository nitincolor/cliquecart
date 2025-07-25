"use client";

import Loader from "@/components/Common/Loader";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

type Input = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

export function PasswordChange() {
  const {
    register,
    getValues,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm<Input>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const { data: session } = useSession();

  const onSubmit = async (data: Input) => {
    setIsLoading(true);
    const { currentPassword, newPassword } = data;

    try {
      await axios.post("/api/profile/change-password", {
        id: session?.user?.id,
        email: session?.user?.email,
        currentPassword,
        newPassword,
      });

      toast.success("Password changed successfully");
      signOut({
        redirect: true,
        callbackUrl: "/signin",
      });
    } catch (error) {
      toast.error("Password change failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-1 rounded-xl">
      <div className="px-6 py-4 border-b border-gray-3">
        <h2 className="text-base font-medium text-dark">Password Change</h2>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            <Controller
              control={control}
              name="currentPassword"
              rules={{
                pattern: passwordPattern,
                required: true,
              }}
              render={({ field, fieldState }) => (
                <div className="w-full">
                  <InputGroup
                    label="Old Password"
                    type="password"
                    required
                    error={!!fieldState.error}
                    errorMessage="Minimum 6 characters with 1 uppercase, 1 lowercase, and 1 number."
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="newPassword"
              rules={{
                pattern: passwordPattern,
                required: true,
              }}
              render={({ field, fieldState }) => (
                <div className="w-full">
                  <InputGroup
                    label="New Password"
                    type="password"
                    required
                    error={!!fieldState.error}
                    errorMessage="Minimum 6 characters with 1 uppercase, 1 lowercase, and 1 number."
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                pattern: passwordPattern,
                required: true,
                validate: (value) =>
                  value === getValues("newPassword") ||
                  "Passwords do not match",
              }}
              render={({ field, fieldState }) => (
                <div className="w-full">
                  <InputGroup
                    label="Confirm New Password"
                    type="password"
                    required
                    error={!!fieldState.error}
                    errorMessage={
                      fieldState.error?.message ||
                      "Minimum 6 characters with 1 uppercase, 1 lowercase, and 1 number."
                    }
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />

            <button
              className={cn(
                "inline-flex items-center gap-2 font-normal text-white bg-blue py-3 px-4 rounded-lg text-sm ease-out duration-200 hover:bg-blue-dark",
                {
                  "opacity-80 pointer-events-none": isLoading,
                }
              )}
              disabled={isLoading}
            >
              Change Password {isLoading && <Loader />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
