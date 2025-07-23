"use client";

import { CallIcon, EmailIcon, MapIcon } from "@/assets/icons";

import Loader from "@/components/Common/Loader";
import { InputGroup } from "@/components/ui/input";
import cn from "@/utils/cn";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

type Input = {
  firstName: string;
  lastName: string;
  subject: string;
  phone: string;
  message: string;
};

const Contact = ({ formId }: { formId: string }) => {
  const { register, control, formState, handleSubmit, reset } = useForm<Input>({
    defaultValues: {
      firstName: "",
      lastName: "",
      subject: "",
      phone: "",
      message: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const router = useRouter();

  const onSubmit = async (data: Input) => {
    setIsLoading(true); 
    try {
      // Simulate form submission (replace with your actual API call)
      const response = await fetch(`https://formbold.com/s/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data }),
      });

      if (response.ok) {
        setStatus("success");
        reset();
        router.push("/mail-success");
        setIsLoading(false);
      } else {
        const data = await response.json();
        setStatus("error");
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="pb-20 overflow-hidden bg-gray-2">
        <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="w-full bg-white xl:col-span-3 rounded-xl shadow-1">
              <div className="py-5 px-4 sm:px-7.5 border-b border-gray-3">
                <p className="text-xl font-medium text-dark">
                  Contact Information
                </p>
              </div>

              <div className="p-4 sm:p-7.5">
                <div className="flex flex-col gap-4">
                  <p className="flex items-center gap-4">
                    <EmailIcon width={22} height={22} className="fill-blue" />
                    Email: jamse@example.com
                  </p>

                  <p className="flex items-center gap-4">
                    <CallIcon width={22} height={22} className="fill-blue" />
                    Phone: 1234 567890
                  </p>

                  <p className="flex gap-4">
                    <MapIcon
                      width={22}
                      height={22}
                      className="fill-blue shrink-0"
                    />
                    Address: 7398 Smoke Ranch RoadLas Vegas, Nevada 89128
                  </p>
                </div>
              </div>
            </div>

            <div className="xl:col-span-9 w-full bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-5 mb-5 lg:flex-row sm:gap-8">
                  <Controller
                    control={control}
                    name="firstName"
                    rules={{ required: "First Name is required" }}
                    render={({ field, fieldState }) => (
                      <div className="w-full">
                        <InputGroup
                          label="First Name"
                          placeholder="John"
                          error={!!fieldState.error}
                          errorMessage={fieldState.error?.message}
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          required
                        />
                      </div>
                    )}
                  />

                  <Controller
                    control={control}
                    name="lastName"
                    rules={{ required: "Last Name is required" }}
                    render={({ field, fieldState }) => (
                      <div className="w-full">
                        <InputGroup
                          label="Last Name"
                          placeholder="Deo"
                          error={!!fieldState.error}
                          errorMessage={fieldState.error?.message}
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          required
                        />
                      </div>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-5 mb-5 lg:flex-row sm:gap-8">
                  <Controller
                    control={control}
                    name="subject"
                    rules={{ required: "Subject is required" }}
                    render={({ field, fieldState }) => (
                      <div className="w-full">
                        <InputGroup
                          label="Subject"
                          placeholder="Type your subject"
                          error={!!fieldState.error}
                          errorMessage={fieldState.error?.message}
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          required
                        />
                      </div>
                    )}
                  />

                  <Controller
                    control={control}
                    name="phone"
                    rules={{ required: "Phone is required" }}
                    render={({ field, fieldState }) => (
                      <div className="w-full">
                        <InputGroup
                          type="tel"
                          label="Phone"
                          placeholder="Enter your phone"
                          error={!!fieldState.error}
                          errorMessage={fieldState.error?.message}
                          name={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          required
                        />
                      </div>
                    )}
                  />
                </div>

                <div className="mb-7.5">
                  <label
                    htmlFor="message"
                    className="block mb-1.5 text-sm text-gray-6"
                  >
                    Message
                  </label>

                  <textarea
                    {...register("message", {
                      required: "Message is required",
                    })}
                    id="message"
                    rows={5}
                    placeholder="Type your message"
                    className="rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3    focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
                  />

                  {formState.errors.message && (
                    <p className="mt-1 text-sm text-red">
                      {formState.errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className={cn(
                    "inline-flex items-center gap-2 font-normal text-white bg-blue py-3 px-7 rounded-lg text-sm ease-out duration-200 hover:bg-blue-dark",
                    {
                      "opacity-80 pointer-events-none": isLoading,
                    }
                  )}
                  disabled={isLoading}
                >
                  Send Message {isLoading && <Loader />}
                </button>

                {status === "success" && (
                  <div className="text-base text-green mt-3">Message sent successfully!</div>
                )}
                {status === "error" && (
                  <div className="text-base text-red mt-3">
                    Message sent failed!
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
