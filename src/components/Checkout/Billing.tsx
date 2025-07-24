"use client";
import { CheckMarkIcon } from "@/assets/icons";
import { Controller } from "react-hook-form";
import { InputGroup } from "../ui/input";
import { useCheckoutForm } from "./form";
import { ChevronDown } from "./icons";
import { useSession } from "next-auth/react";

export default function Billing() {
  const { register, errors, control } = useCheckoutForm();
  const session = useSession();

  return (
    <div className="bg-white shadow-1 rounded-[10px] ">
      <div className="p-6 py-5 border-b border-gray-3">
        <h2 className="text-lg font-medium text-dark">Billing details</h2>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Controller
            control={control}
            rules={{ required: true }}
            name="billing.firstName"
            render={({ field, fieldState }) => (
              <InputGroup
                label="First Name"
                placeholder="John"
                required
                error={!!fieldState.error}
                errorMessage="First name is required"
                name={field.name}
                value={session.data?.user?.name || field.value}
                onChange={field.onChange}
                readOnly={!!session.data?.user?.name}
              />
            )}
          />

          <Controller
            control={control}
            rules={{ required: true }}
            name="billing.lastName"
            render={({ field, fieldState }) => (
              <InputGroup
                label="Last Name"
                placeholder="Doe"
                error={!!fieldState.error}
                errorMessage="Last name is required"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <Controller
            control={control}
            name="billing.companyName"
            render={({ field }) => (
              <InputGroup
                label="Company Name"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <label
            htmlFor="regionName"
            className="block mb-1.5 text-sm text-gray-6"
          >
            Region
            <span className="text-red">*</span>
          </label>

          <div className="relative">
            <select
              {...register("billing.regionName", { required: true })}
              id="regionName"
              className="rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
              required
            >
              <option value="" hidden>
                Select your country
              </option>

              <option value="australia">Australia</option>
              <option value="america">America</option>
              <option value="england">England</option>
            </select>
          </div>

          {errors.billing?.regionName && (
            <p className="text-sm text-red mt-1.5">Region is required</p>
          )}
        </div>

        <div>
          <Controller
            control={control}
            rules={{ required: true }}
            name="billing.address.street"
            render={({ field, fieldState }) => (
              <InputGroup
                label="Street Address"
                placeholder="House number and street name"
                required
                error={!!fieldState.error}
                errorMessage="Street address is required"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <div className="mt-5">
            <input
              type="text"
              {...register("billing.address.apartment")}
              placeholder="Apartment, suite, unit, etc. (optional)"
              className="rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
            />
          </div>
        </div>

        <div>
          <Controller
            control={control}
            rules={{ required: true }}
            name="billing.town"
            render={({ field, fieldState }) => (
              <InputGroup
                label="Town/City"
                required
                error={!!fieldState.error}
                errorMessage="Town is required"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <Controller
            control={control}
            rules={{ required: true }}
            name="billing.country"
            render={({ field }) => (
              <InputGroup
                label="Country"
                required
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <Controller
            control={control}
            rules={{ required: true }}
            name="billing.phone"
            render={({ field, fieldState }) => (
              <InputGroup
                type="tel"
                label="Phone"
                required
                error={!!fieldState.error}
                errorMessage="Phone number is required"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <Controller
            control={control}
            rules={{ required: true }}
            name="billing.email"
            render={({ field, fieldState }) => (
              <InputGroup
                label="Email Address"
                type="email"
                required
                error={!!fieldState.error}
                errorMessage="Email is required"
                name={field.name}
                value={session?.data?.user?.email || field.value}
                onChange={field.onChange}
                readOnly={!!session?.data?.user?.email}
              />
            )}
          />
        </div>

        {!session?.data?.user?.email && (
          <div>
            <label
              htmlFor="create-account-checkbox"
              className="flex items-center space-x-2 text-sm cursor-pointer text-gray-6"
            >
              <input
                type="checkbox"
                {...register("billing.createAccount")}
                id="create-account-checkbox"
                className="sr-only peer"
              />

              <div className="rounded border size-4 text-white flex items-center justify-center border-gray-4 peer-checked:bg-blue peer-checked:border-blue [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
                <CheckMarkIcon />
              </div>

              <span>Create an Account</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
