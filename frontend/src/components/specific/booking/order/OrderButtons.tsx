import Link from "next/link";

export function OrderHomeButton() {

    return (
        <Link
            href="/"
        >
            <button
                className="px-8 py-4 text-white text-xl rounded-xl border border-white transition hover:opacity-70 hover:cursor-pointer"
            >
                Browse More Movies
            </button>
        </Link>
    );
}


export function OrderHistoryButton() {

    return (
        <Link
            href="/user/orders"
        >
            <button
                className="px-8 py-4 text-white font-bold text-xl rounded-xl bg-acm-pink transition hover:opacity-70 hover:cursor-pointer"
            >
                View Order History
            </button>
        </Link>
    );

}