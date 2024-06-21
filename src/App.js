import React, { useState, useRef, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import { ConnectButton, useActiveAddress } from "arweave-wallet-kit";
import AoConnect from './AoConnect.js';
import 'xterm/css/xterm.css';
import './App.css';

function App() {
    const [processName, setProcessName] = useState("default");
    const [connecting, setConnecting] = useState(false);
    const [connectProcessId, setConnectProcessId] = useState("");
    const [contentedAddress, setContentedAddress] = useState("");
    const [terminalUrl, setTerminalUrl] = useState("");
    const terminalContainerRef = useRef(null);

    const activeAddress = useActiveAddress();

    useEffect(() => {
        queryAllProcesses(activeAddress);
        setContentedAddress(activeAddress);
    }, [activeAddress]);

    const connectWallet = async () => {
        if (window.arweaveWallet) {
            try {
                await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'ACCESS_PUBLIC_KEY']);
                const addr = await window.arweaveWallet.getActiveAddress();
                setContentedAddress(addr);
            } catch (error) {
                console.error('Error connecting to wallet:', error);
            }
        } else {
            console.error('ArConnect wallet not found');
        }
    };

    const spawnProcess = () => {
        if (window.arweaveWallet && processName) {
            const tags = [
                { name: "App-Name", value: "aos" },
                { name: "aos-Version", value: "1.10.30" },
                { name: "Name", value: processName },
            ];
            AoConnect.AoCreateProcess(window.arweaveWallet, AoConnect.DEFAULT_MODULE, AoConnect.DEFAULT_SCHEDULER, tags).then(processId => {
                setConnectProcessId(processId);
                setTerminalUrl(`https://placeholder.com/?processId=${processId}`);
                setConnecting(false);
            });
        }
    };

    const queryAllProcesses = (address) => {
        if (address && contentedAddress === address) {
            if (processName.length === 43) {
                const processId = processName;
                setConnectProcessId(processId);
                setTerminalUrl(`https://placeholder.com/?processId=${processId}`);
            } else {
                AoConnect.AoQueryProcesses(address, processName).then(processInfoList => {
                    if (processInfoList && processInfoList.length > 0) {
                        const processId = processInfoList[0].id;
                        setConnectProcessId(processId);
                        setTerminalUrl(`https://placeholder.com/?processId=${processId}`);
                        setConnecting(false);
                    } else {
                        spawnProcess();
                    }
                });
            }
        }
    };

    return (
        <Container>
            <Typography variant="h2" component="h1" gutterBottom>
                Hyper. Parallel. Computer.
            </Typography>
            <Box sx={{ my: 4 }}>
                <Card>
                    <CardHeader title="Connect to Arweave Wallet" />
                    <CardContent>
                        <ConnectButton />
                    </CardContent>
                </Card>
                {contentedAddress && (
                    <Card>
                        <CardHeader title="Enter Process ID or Name" />
                        <CardContent>
                            <TextField
                                fullWidth
                                placeholder="Process Name"
                                value={processName}
                                onChange={(e) => setProcessName(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">ID</InputAdornment>,
                                }}
                            />
                            <Button variant="contained" color="primary" onClick={spawnProcess} disabled={connecting}>
                                {connecting ? 'Connecting...' : 'Open Terminal'}
                            </Button>
                        </CardContent>
                    </Card>
                )}
                {terminalUrl && (
                    <Box ref={terminalContainerRef} sx={{ mt: 4 }}>
                        <iframe title="AOS Terminal" src={terminalUrl} width="100%" height="500px"></iframe>
                    </Box>
                )}
            </Box>
        </Container>
    );
}

export default App;
