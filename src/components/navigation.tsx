import Link from "next/link";
import React from "react";

const Navigation = () => {
  return (
    <div className="border-primary flex border-y-2">
      <header className="border-primary mx-auto flex w-full max-w-5xl items-center justify-between border-x-2">
        <div className="bg-primary flex items-center gap-2 px-8 py-4 font-mono text-white">
          <h1 className="text-2xl">7702</h1>
          <span className="text-xl">x</span>
          <span className="text-2xl">ZeroDev</span>
        </div>
        <nav className="flex gap-6">
          <Link
            href="https://docs.zerodev.app"
            className="hover:text-primary px-4 py-2"
          >
            Docs
          </Link>
          <Link
            href="https://eips.ethereum.org/EIPS/eip-7702"
            className="hover:text-primary px-4 py-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            EIP
          </Link>
        </nav>
      </header>
    </div>
  );
};

export default Navigation;
