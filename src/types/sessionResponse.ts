export interface ISessionResponse {
    sid: string;
    isSuspicious: boolean;
    isTrusted: boolean;
    loggedIn: boolean;
    accessToken: string;
    account: {
        _id: string;
        name: string;
        email: string;
        status: string;
        [key: string]: any;
    };
    roleName: string;
}

export interface ICheckSessionResponse {
    sid: string;
    loggedIn: boolean;
    roleName: string;
}