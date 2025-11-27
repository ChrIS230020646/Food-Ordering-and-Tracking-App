import React, { useState, useEffect, useRef } from 'react';
import { backendApi, User } from '../services/api';

const BackendTest: React.FC = () => {
    const [backendStatus, setBackendStatus] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [users, setUsers] = useState<User[]>([]);
    const [name, setName] = useState<string>('');
    const [newUser, setNewUser] = useState({ name: '', email: '' });
    const [countdown, setCountdown] = useState<number>(0);
    const [isCounting, setIsCounting] = useState<boolean>(false);
    const countdownRef = useRef<ReturnType<typeof setInterval>>();

    const testConnection = async () => {
        try {
            const status = await backendApi.healthCheck();
            setBackendStatus(status);
        } catch (error) {
            setBackendStatus('後端鏈接失敗！');
            console.error('Connection error:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            console.log('Start get users');
            const userList = await backendApi.getUsers();
            console.log('User List:', userList);
            setUsers(userList);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleHello = async () => {
        if (!name.trim()) return;
        try {
            const result = await backendApi.sayHello(name);
            setMessage(result);
        } catch (error) {
            setMessage('調用API失敗');
            console.error('Error:', error);
        }
    };

    const clearCountdown = () => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = undefined;
        }
        setIsCounting(false);
        setCountdown(0);
    };

    const handleCreateUser = async () => {
        if (!newUser.name.trim() || !newUser.email.trim()) return;
        try {
            const createdUser = await backendApi.createUser(newUser);
            setMessage(`用戶創建成功: ${createdUser.name}`);
            setNewUser({ name: '', email: '' });

            setIsCounting(true);
            setCountdown(5);

            countdownRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearCountdown();
                        console.log('正在刷新列表');
                        fetchUsers();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (error) {
            setMessage('用戶創建失敗');
            console.error('Error:', error);
            clearCountdown();
        }
    };

    useEffect(() => {
        testConnection();
        fetchUsers();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>前後端連接測試</h2>

            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
                <h3>後端狀態</h3>
                <p>{backendStatus || '检测中...'}</p>
                <button onClick={testConnection}>重新檢測</button>
            </div>

            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
                <h3>打招呼測試</h3>
                <input
                    type="text"
                    placeholder="输入你的名字"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <button onClick={handleHello}>Say Hi啦你</button>
                {message && <p style={{ marginTop: '10px' }}>屌你output: {message}</p>}
            </div>

            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
                <h3>創建用戶</h3>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="用户名"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        style={{ marginRight: '10px', padding: '5px' }}
                    />
                    <input
                        type="email"
                        placeholder="邮箱"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        style={{ marginRight: '10px', padding: '5px' }}
                    />
                    <button onClick={handleCreateUser}>创建用户</button>
                </div>
                {isCounting && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '10px',
                        padding: '10px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: `conic-gradient(#007bff ${(5 - countdown) * 20}%, #e9ecef 0%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            <span style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: 'black'
                            }}>
                                {countdown}
                            </span>
                        </div>
                        <span>Refreshing...</span>
                        <button
                            onClick={clearCountdown}
                            style={{
                                padding: '2px 8px',
                                fontSize: '12px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Skip
                        </button>
                    </div>
                )}
            </div>

            <div style={{ padding: '10px', border: '1px solid #ccc' }}>
                <h3>用戶list</h3>
                <button onClick={fetchUsers} style={{ marginBottom: '10px' }}>Refresh</button>
                {users.length === 0 ? (
                    <p>冇數據wor~</p>
                ) : (
                    <ul>
                        {users.map(user => (
                            <li key={user.id}>
                                {user.name} - {user.email}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default BackendTest;