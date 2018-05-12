import * as fs from "fs";
import * as path from "path";

export default class StorageProvider {

    private filePath = "../../existing-articles.json";

    public constructor() {
        this.filePath = path.join(__dirname, this.filePath);
    }

    public addOne(address: string): void {
        const existing = this.getAll();
        existing.push(address);
        fs.writeFileSync(this.filePath, JSON.stringify(existing, null, "\t"));
    }

    public getAll(): string[] {
        if (!fs.existsSync(this.filePath)) {
            return [];
        }
        else {
            return JSON.parse(fs.readFileSync(this.filePath).toString());
        }
    }


}