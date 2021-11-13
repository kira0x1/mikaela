import Agenda, { Job } from 'agenda';
import ms from 'ms';
import { client } from '../app';
import * as config from '../config';

const agenda = new Agenda({ db: { address: config.dbURI }, processEvery: '5 seconds' });

agenda.define('remind', { priority: 10, concurrency: 10 }, async (job: Job) => {
   const { userId, content }: { userId?: string; content?: string } = job.attrs.data;
   const target = await client.users.fetch(userId);
   await target.send(content);
});

export async function initAgenda() {
   await agenda.start();
}

export async function stopAgenda() {
   await agenda.stop();
}

export function createReminderJob(userId: string, message: string, remindIn: number) {
   agenda.schedule(ms(remindIn, { long: true }), 'remind', { userId, message });
}

export async function createRepeatingReminderJob(userId: string, message: string, remindEvery: number) {
   const remindJob = agenda.create('remind', { userId, message });
   await remindJob.repeatEvery(ms(remindEvery, { long: true })).save();
}
