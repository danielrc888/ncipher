import React, { useState, useEffect } from 'react'
import axios from 'axios';

const transactionsData = [];

function Transactions() {
    const [interval, setIntervalValue] = useState(1);
    const [transactions, setTransactions] = useState(transactionsData);
    const [countdown, setCountdown] = useState(interval * 60);
    const [loading, setLoading] = useState(false);

    // Handle interval input change
    const handleInputChange = (e) => {
        setIntervalValue(e.target.value);
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/transactions/binance_whale_txs');
            setTransactions(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    useEffect(() => {
        fetchTransactions(); // Fetch transactions when component mounts
    }, []);

    // Simulate auto-refresh based on interval
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCountdown((prev) => (prev === 0 ? interval * 60 : prev - 1));
            if (countdown === 0) {
                console.log('Refreshing transactions...');
                fetchTransactions();
                setCountdown(interval * 60); // Reset countdown
            }
        }, 1000);

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [countdown, interval]);

    return (
        <div className="container">
            <h1 className="text-white p-[12px] md:p-[15px] font-regular md:font-bold md:text-[25px] sm:text-[17px] text-[15px]">Transactions</h1>
            <div className="interval-input">
                <input
                    type="number"
                    value={interval}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Enter interval in minutes"
                />
                <button className="clipButton font-[Nippo] w-[130px]" onClick={() => setCountdown(interval * 60)}>Set Interval</button>
            </div>
            <p className="text-white p-[12px] md:p-[15px] font-regular md:font-bold md:text-[25px] sm:text-[17px] text-[15px]">Your transactions will be refreshed in {countdown} seconds</p>
            { loading ? (
                <p className="text-white p-[12px] md:p-[15px] font-regular md:font-bold md:text-[25px] sm:text-[17px] text-[15px]">Loading...</p>
              ): (
                <table className="text-white p-[12px] md:p-[15px] font-regular md:font-bold md:text-[25px] sm:text-[17px] text-[15px]" >
                    <thead>
                        <tr>
                            <th>Hash</th>
                            <th>Amount</th>
                            <th>Sender</th>
                            <th>To</th>
                            <th>Block Height</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, index) => (
                            <tr key={index}>
                                <td>{tx.transaction.hash}</td>
                                <td>{`${tx.amount} BNB`} </td>
                                <td>{tx.sender.address}</td>
                                <td>{tx.receiver.address}</td>
                                <td>{tx.block.height}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              )
            }
            
        </div>
    );
}

export default Transactions;
