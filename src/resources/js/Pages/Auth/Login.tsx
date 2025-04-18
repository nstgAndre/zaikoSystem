import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { GuestLayout } from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { type FormEventHandler, useEffect } from "react";

export default function Login({
	status,
	canResetPassword,
}: {
	status?: string;
	canResetPassword: boolean;
}) {
	const { data, setData, post, processing, errors, reset } = useForm({
		email: "",
		password: "",
		remember: false,
	});

	useEffect(() => {
		return () => {
			reset("password");
		};
	}, []);

	const submit: FormEventHandler = (e) => {
		e.preventDefault();

		post(route("login"), {
			onSuccess: () => {
				window.location.href = route("index");
			},
		});
	};

	return (
		<GuestLayout className="bg-deepblue">
			<Head title="Log in" />

			{status && (
				<div className="mb-4 font-medium text-sm text-green-600">{status}</div>
			)}
			<h1 className="text-white text-center text-3xl">Login</h1>
			<form onSubmit={submit} className="max-w-md mx-auto">
				<div>
					<InputLabel
                        htmlFor="email"
                        value="Email"
                        className="text-white"
                    />

					<TextInput
						id="email"
						type="email"
						name="email"
						value={data.email}
						className="mt-1 block w-full"
						autoComplete="username"
						isFocused={true}
						onChange={(e)=>setData("email",e.target.value)}
					/>

					<InputError message={errors.email} className="mt-2" />
				</div>

				<div className="mt-4">
					<InputLabel htmlFor="password" value="Password" className="text-white"/>

					<TextInput
						id="password"
						type="password"
						name="password"
						value={data.password}
						className="mt-1 block w-full"
						autoComplete="current-password"
						onChange={(e) => setData("password", e.target.value)}
					/>

					<InputError message={errors.password} className="mt-2" />
				</div>

				<div className="block mt-4">
					<label htmlFor="remember" className="flex items-center">
						<Checkbox
							id="remember"
							name="remember"
							checked={data.remember}
							onChange={(e) => setData("remember", e.target.checked)}
						/>
						<span className="ms-2 text-sm text-gray-600 text-white">
                            Remember me
						</span>
					</label>
				</div>

				<div className="flex items-center justify-center mt-4">
				<PrimaryButton className="ms-4" disabled={processing}>
					Log in
				</PrimaryButton>
				</div>
			</form>
		</GuestLayout>
	);
}
