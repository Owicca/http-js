const values = {
    "newline": '\n',
};

function __(key: string): string {
    return values[key];
}

export {__}