import axios from "axios"

const url = 'https://ample.hashwave.io/api/';

class Api {
    static async getLoginStatus(): Promise<boolean>{
        return new Promise((resolve, reject) => {
            axios.get(url + 'loginCheck')
                .then((res: { data: boolean; }) => {
                    let data = res.data;
                    resolve(data);
                })
                .catch((err: any) => {
                    reject(err);
                })
        });
    }

    static async getMessageToSign(address: string): Promise<string> {
        return new Promise((resolve, reject) => {
            axios.get(url + 'auth/msg', {
                params: {
                    address: address
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

    // this api does nothing and should never be used
    static postSignature(address: string, signature: string): any {
        axios.post(url + 'auth/verify', {
            address: address,
            signature: signature
        })
            .then(function (res: any) {
                console.log(res);
                return 200
            })
            .catch(function (err: any) {
                console.log(err);
                return 400
            });
    }

    static async getSourceList(): Promise<Array<string>> {
        return new Promise((resolve, reject) => {
            axios.get(url + 'read/sourceList')
                .then((res: { data: any; }) => {
                    let data = res.data;
                    resolve(data);
                })
                .catch((err: any) => {
                    reject(err);
                })
        });
    }

    static async getDB(): Promise<any> {
        return new Promise((resolve, reject) => {
            axios.get(url + 'read/db')
                .then((res: { data: any; }) => {
                    let data = res.data;
                    resolve(data);
                })
                .catch((err: any) => {
                    reject(err);
                })
        });
    }

    static async editDocument(address: string, signature: string, collectionName: string, id: string, modDic: any): Promise<number> {
        return new Promise((resolve, reject) => {
            axios.post(url + 'auth/update/document', {
                address: address,
                signature: signature,
                collectionName: collectionName,
                id: id,
                modDic: modDic
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
    static newCollection(address: string, signature: string, collectionName: string) {
        axios.post(url + 'auth/insert/collection', {
            address: address,
            signature: signature,
            collectionName: collectionName
        })
            .then(function (res: any) {
                console.log(res);
            })
            .catch(function (err: any) {
                console.log(err);
            });
    }

    static newDocument(address: string, signature: string, collectionName: string, modDic: any): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            axios.post(url + 'auth/insert/document', {
                address: address,
                signature: signature,
                collectionName: collectionName,
                modDic: modDic
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