import axios from "axios"

const url = 'https://ample.hashwave.io/api/';

class Api {
    static async getSourceList(token: string): Promise<Array<string>> {
        return new Promise((resolve, reject) => {
            axios.get(url + 'db/sourceList',{
                headers: {
                    Authorization: 'Bearer ' + token
                }
            })
                .then((res: { data: any; }) => {
                    let data = res.data;
                    resolve(data);
                })
                .catch((err: any) => {
                    reject(err);
                })
        });
    }

    static async getDB(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            axios.get(url + 'db/db',{
                headers: {
                    Authorization: 'Bearer ' + token
                }
            })
                .then((res: { data: any; }) => {
                    let data = res.data;
                    resolve(data);
                })
                .catch((err: any) => {
                    reject(err);
                })
        });
    }

    static async getMessageToSign(address: string, token: string): Promise<string> {
        return new Promise((resolve, reject) => {
            axios.get(url + 'ethsign/msg', {
                params: {
                    address: address
                },
                headers: {
                    Authorization: 'Bearer ' + token
                }
            })
                .then((res: { data: string; }) => {
                    let data = res.data;
                    resolve(data);
                })
                .catch((err: any) => {
                    reject(err);
                })
        });
    }

    static async editDocument(token: string, address: string, signature: string, collectionName: string, id: string, modDic: any): Promise<number> {
        return new Promise((resolve, reject) => {
            axios.post(url + 'ethsign/update/document', {
                address: address,
                signature: signature,
                collectionName: collectionName,
                id: id,
                modDic: modDic,
                headers: {
                    Authorization: 'Bearer ' + token
                }
            })
                .then(function (res: any) {
                    resolve(res.status)
                })
                .catch(function (err: any) {
                    resolve(err.response.status)
                });
        })
    }

    // this api is currently not supported
    static newCollection(token: string, address: string, signature: string, collectionName: string) {
        axios.post(url + 'ethsign/insert/collection', {
            address: address,
            signature: signature,
            collectionName: collectionName,
            headers: {
                Authorization: 'Bearer ' + token
            }
        })
            .then(function (res: any) {
                console.log(res);
            })
            .catch(function (err: any) {
                console.log(err);
            });
    }

    static newDocument(token: string, address: string, signature: string, collectionName: string, modDic: any): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            axios.post(url + 'ethsign/insert/document', {
                address: address,
                signature: signature,
                collectionName: collectionName,
                modDic: modDic,
                headers: {
                    Authorization: 'Bearer ' + token
                }
            })
                .then(function (res: any) {
                    resolve([res.status, res.data])
                })
                .catch(function (err: any) {
                    resolve([err.response.status, ""])
                });
        })
    }
}

export default Api