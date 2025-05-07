import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-primary w-full py-8 text-white">
      <div className="container mx-auto flex max-w-5xl flex-col justify-between px-6 md:flex-row md:items-center">
        <div className="mb-8 flex items-center gap-4 font-mono text-2xl md:mb-0">
          <span className="font-bold">7702</span>
          <span className="text-xl">x</span>
          <span className="font-bold">ZeroDev</span>
        </div>

        <div className="grid grid-cols-1 gap-x-16">
          <div className="flex flex-col space-y-2">
            <h3 className="mb-4 text-xl">Resources</h3>
            <Link
              href="https://docs.zerodev.app/sdk/getting-started/quickstart-7702"
              className="hover:underline"
            >
              7702 Docs
            </Link>
            <Link
              href="https://dashboard.zerodev.app"
              className="hover:underline"
            >
              Dashboard
            </Link>
            <Link
              href="https://eips.ethereum.org/EIPS/eip-7702"
              className="hover:underline"
            >
              EIP
            </Link>
          </div>

          {/* <div className="flex flex-col space-y-2">
            <h3 className="mb-4 text-xl">Integrations</h3>
            <Link
              href="/privy"
              className="hover:underline"
            >
              Privy
            </Link>
            <Link
              href="/turnkey"
              className="hover:underline"
            >
              Turnkey
            </Link>
            <Link
              href="/dynamic"
              className="hover:underline"
            >
              Dynamic
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
