declare module 'africastalking' {
    function AfricasTalking(options: { username: string; apiKey: string }): {
        SMS: {
            send(options: {
                to: string | string[];
                message: string;
                from?: string;
                enqueue?: boolean;
            }): Promise<any>;
        };
    };
    export default AfricasTalking;
}
