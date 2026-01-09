'use client';

import React from 'react';

interface SafeHTMLProps {
    html: string;
    className?: string;
}

const SafeHTML: React.FC<SafeHTMLProps> = ({ html, className }) => {
    return (
        <div
            className={`prose prose-sm max-w-none ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export default SafeHTML;
