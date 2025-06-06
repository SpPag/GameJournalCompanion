import React from "react";

interface BookSvgProps {
    className: string,
    onClick?: () => void
}

const BookSvg = ({className, onClick}: BookSvgProps) => {

    return (
        <svg
            className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" onClick={onClick} style={{cursor: onClick ? 'pointer' : 'default'}}
        >
            <path stroke="none" d="M0 0h24v24H0z" />
            <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
            <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
            <line x1="3" y1="6" x2="3" y2="19" />
            <line x1="12" y1="6" x2="12" y2="19" />
            <line x1="21" y1="6" x2="21" y2="19" />
        </svg>
    )
}

export { BookSvg }