import { ConsoleLogger, Injectable } from '@nestjs/common';
import * as fs from "fs";
import {promises as fsPromises} from "fs";
import * as path from "path";

@Injectable()
export class MyLoggerService extends ConsoleLogger {

    async logToFile(entry){
        const formattedEntry = `${Intl.DateTimeFormat('en-US', {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: 'America/Chicago',
        }).format(new Date())}\t${entry}\n`

        try {
            // we first check if our log file exits
            if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))){
                // create a new log file if none exits
                await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'))
            }
            // Append to that file
            await fsPromises.appendFile(path.join(__dirname, '..', '..', 'logs', 'myLogFile.log'), formattedEntry);

        } catch (e) {
            if (e instanceof Error) console.error(e.message)
        }
    }

    log(message: any, context?: string) {
        // create a new entry for the log which would be entered into our text file.
        const entry = `${context}\t${message}`;

        this.logToFile(entry);

        super.log(message, context)
    }

    error(message: any, stackOrContext?: string): void {
        // create a new entry for the log which would be entered into our text file.
        const entry = `${stackOrContext}\t${message}`;

        this.logToFile(entry);
        
        super.error(message, stackOrContext);
    }
}
