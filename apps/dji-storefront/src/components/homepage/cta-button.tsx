import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { buildInternalLink } from '@/lib/util/links';

interface CTAButtonProps {
    label: string;
    url: string;
    style?: 'primary' | 'secondary' | 'text';
    openInNewTab?: boolean;
    icon?: string;
    className?: string;
    countryCode?: string;
}

export function CTAButton({
    label,
    url,
    style = 'primary',
    openInNewTab = false,
    className = '',
    countryCode,
}: CTAButtonProps) {
    // Process URL with country code if provided
    const processedUrl = countryCode ? buildInternalLink(url, countryCode) : url;
    const baseStyles =
        'inline-flex items-center gap-1 transition-all duration-200 font-medium';

    const styleVariants = {
        primary:
            'bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-full shadow-sm hover:shadow-md',
        secondary:
            'bg-transparent hover:bg-blue-50 text-blue-600 dark:text-blue-400 px-5 py-1.5 rounded-full border-2 border-blue-600 dark:border-blue-400',
        text: 'text-blue-600 dark:text-blue-400 hover:underline',
    };

    const combinedStyles = `${baseStyles} ${styleVariants[style]} ${className}`;

    return (
        <Link
            href={processedUrl}
            target={openInNewTab ? '_blank' : undefined}
            rel={openInNewTab ? 'noopener noreferrer' : undefined}
            className={combinedStyles}
        >
            {label}
            {style === 'text' && <ChevronRight className="w-4 h-4" />}
        </Link>
    );
}
