'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { BookSvg } from "./BookSvg";

interface BookSvgClickableProps {
    className: string;
};

const BookSvgClickable = ({className}: BookSvgClickableProps) => {
    const router = useRouter();

    return (
        <BookSvg className={className} onClick={() => router.push("/")}/>
    )
}

export { BookSvgClickable }