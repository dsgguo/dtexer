/// <reference types="vite/client" />

declare module 'react-katex' {
    import React from 'react';
    export interface LatexProps {
        children: string;
        block?: boolean;
    }
    const Latex: React.FC<LatexProps>;
    export default Latex;
}
