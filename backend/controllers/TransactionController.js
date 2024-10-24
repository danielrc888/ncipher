const axios = require('axios');
const BITQUERY_KEY = "<--HERE GOES YOUR BITQUERY KEY-->"

const fetchWhaleAddresses = async () => {
    try {
        const query = `
            {
                ethereum(network: bsc) {
                    transfers(
                    options: {desc: "amount", limit: 10, offset: 0}
                    date: {since: "2024-10-22"}
                    currency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
                    amount: {gt: 0}
                    ) {
                    sender {
                        address
                        annotation
                    }
                    receiver {
                        address
                        annotation
                    }
                    currency {
                        address
                        symbol
                    }
                    amount
                    amount_usd: amount(in: USD)
                    transaction {
                        hash
                    }
                    external
                    }
                }
            }
        `;
        const response = await axios.post('https://graphql.bitquery.io/', {
            query,
        }, {
            headers: {
                'X-API-KEY': BITQUERY_KEY,
            },
        });
        
        const transactions = response.data.data.ethereum.transfers;
        const whaleAddresses = [...new Set(transactions.map(tx => tx.sender.address))];
        return whaleAddresses
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return []
    }
}

exports.getWhaleTxs = async (req, res) => {
    try {
        const whaleAddresses = await fetchWhaleAddresses();
        const query = `
            {
                ethereum(network: bsc) {
                    transfers(
                    options: {desc: "amount", limit: 20, offset: 0}
                    date: {since: "2024-10-22"}
                    amount: {gt: 0}
                    currency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
                    sender: {in: ${JSON.stringify(whaleAddresses)}}
                    ) {
                    block {
                        timestamp {
                        time(format: "%Y-%m-%d %H:%M:%S")
                        }
                        height
                    }
                    sender {
                        address
                        annotation
                    }
                    receiver {
                        address
                        annotation
                    }
                    currency {
                        address
                        symbol
                    }
                    amount
                    amount_usd: amount(in: USD)
                    transaction {
                        hash
                    }
                    external
                    }
                }
            }
        `;

        const response = await axios.post('https://graphql.bitquery.io/', {
            query,
        }, {
            headers: {
                'X-API-KEY': BITQUERY_KEY,
            },
        });
        const transactions = response.data.data.ethereum.transfers;
        res.status(200).json(transactions)
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({error: 'Internal server'})
    }
}