"use client";

import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

export const Footer = () => {
  const information = [
    { url: "/about-us", title: "About Us" },
    { url: "/contact-us", title: "Contact Us" },
    { url: "/blogs", title: "Blogs" },
  ];

  return (
    <footer className="bg-gray-200 text-gray-900">
      <section className="py-8">
        <div className="container mx-auto pt-4 pb-5">
          <div className="flex flex-wrap -mx-4">
            {/* Left column - 5/12 */}
            <div className="w-full md:w-6/12 px-4 mb-8 md:mb-0">
              <div className="mb-6">
                <Link href="/">
                  <Image
                    src="/kicbak-logo.png"
                    alt="Kicbak"
                    width={200}
                    height={60}
                    className="h-12 w-auto"
                  />
                </Link>

                <h5 className="text-sm font-semibold mt-5 mb-3">Contact</h5>
                <p className="mb-1">
                  <span className="font-semibold">Phone: </span>+0000000000000
                </p>
                <p className="mb-3">
                  <span className="font-semibold">Email: </span>
                  info@kickback.com
                </p>

                <h5 className="text-gray-400 font-semibold text-sm mb-3">
                  Follow Us
                </h5>
                <div className="flex space-x-4">
                  <Link href="" aria-label="Facebook">
                    <FaFacebookF
                      className="mt-1 hover:text-primary hover:scale-110 transition-transform duration-300"
                      size={18}
                    />
                  </Link>
                  <Link href="#" aria-label="Twitter">
                    <FaXTwitter
                      className="mt-1 hover:text-primary hover:scale-110 transition-transform duration-300"
                      size={18}
                    />
                  </Link>
                  <Link href="" aria-label="Linkedin">
                    <FaLinkedinIn
                      className="mt-1 hover:text-primary hover:scale-110 transition-transform duration-300"
                      size={20}
                    />
                  </Link>
                  <Link
                    href="https://www.instagram.com/"
                    aria-label="Instagram"
                  >
                    <FaInstagram
                      className="mt-1 hover:text-primary hover:scale-110 transition-transform duration-300"
                      size={18}
                    />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right column - 7/12 */}
            <div className="w-full md:w-6/12 px-4">
              <div className="flex flex-wrap justify-end">
                {/* Resources */}
                <div className="w-1/2 px-4 mb-8 md:mb-0">
                  <h5 className="font-bold text-xl mb-4">Information</h5>
                  <ul className="space-y-2">
                    {information.map((item, i) => (
                      <li key={i}>
                        <Link
                          href={item.url}
                          className="hover:text-primary transition-all duration-300 inline-block transform hover:translate-x-0.5"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company */}
                <div className="w-1/2 px-4">
                  <h5 className="font-bold text-xl mb-4">Location</h5>
                  <p>
                    XXX, <br /> XXXX <br /> XXXXX, XXXX
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="pb-10">
        <p className="text-sm  mb-0 text-center">
          <strong className="text-primary">
            Copyright © {new Date().getFullYear()} Kickback
          </strong>{" "}
          | All rights reserved
        </p>
      </div>
    </footer>
  );
};
