import axios from 'axios';
import WebSocket from 'ws';

export const inject = async (log = false, code: string) => {
    const maxAttempts = 12;
    const delay = 5000; // 5 seconds

    let wsURL: string | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const res = await axios.get("http://127.0.0.1:4444/json");
            wsURL = (res.data as any[]).filter((data) => !(data.url as string).startsWith("file:///"))[res.data.length - 1].webSocketDebuggerUrl;
            if (log) console.log("WebSocket Address:", wsURL);
            break; // Exit loop on successful fetch
        } catch (error) {
            if (attempt === maxAttempts) {
                console.error("Failed to fetch WebSocket URL after multiple attempts:", (error as Error).message);
                process.exit(1);
            }
            if (log) console.log(`Attempt ${attempt} to fetch WebSocket URL failed. Retrying in ${delay / 1000} seconds...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }

    if (!wsURL) {
        console.error("WebSocket URL not available.");
        process.exit(1);
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const ws = new WebSocket(wsURL);
            let isConnected = false;

            const timeout = setTimeout(() => {
                if (!isConnected) {
                    ws.terminate();
                }
            }, delay - 1000); // Slightly less than delay

            ws.on('open', () => {
                clearTimeout(timeout);
                isConnected = true;
                if (log) console.log('Connected to Discord WebSocket');
                const payload = {
                    id: 1,
                    method: "Runtime.evaluate",
                    params: {
                        expression: code,
                    }
                };

                ws.send(JSON.stringify(payload));
                if (log) console.log("Payload sent.");
            });

            ws.on('message', (data: any) => {
                if (log) console.log("Message from Discord WebSocket:", data.toString());

                if (data.method === "Runtime.exceptionThrown") {
                    console.error("An exception was thrown while evaluating the payload:", data.params.exceptionDetails);
                    ws.close();
                    process.exit(1);
                }

                if (data.method === "Inspector.detached") {
                    console.error("The inspector was detached while evaluating the payload.");
                    ws.close();
                    process.exit(1);
                }

                // Close WebSocket after successful execution
                ws.close();
            });

            ws.on('error', (error) => {
                if (log) console.error("WebSocket error:", error);
            });

            ws.on('close', () => {
                if (log) console.log("WebSocket connection closed.");
            });

            // Wait for the WebSocket to close before next attempt
            await new Promise(resolve => ws.on('close', resolve));
            break; // Exit loop on successful connection
        } catch (error) {
            if (attempt === maxAttempts) {
                console.error("Failed to connect to WebSocket after multiple attempts.");
                process.exit(1);
            }
            if (log) console.log(`Retrying WebSocket connection (${attempt}/${maxAttempts}) in ${delay / 1000} seconds...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
};