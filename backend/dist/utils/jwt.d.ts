declare const signJWT: (userId: string, roomId?: string) => string;
declare const verifyJWT: (token: string) => {
    userId: string;
    roomId: string;
};
export { signJWT, verifyJWT };
//# sourceMappingURL=jwt.d.ts.map