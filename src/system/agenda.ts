import Agenda, { Job } from 'agenda';
import ms from 'ms';
import { client } from '../app';
import * as config from '../config';

const agenda = new Agenda({ db: { address: config.dbURI }, processEvery: '5 seconds' });

agenda.define('remind', { priority: 10, concurrency: 10 }, async (job: Job) => {
   const { userId, botId, content }: { userId?: string; botId?: string; content?: string } = job.attrs.data;
   if (botId !== client.user.id) return;
   const target = await client.users.fetch(userId);
   await target.send(content);
});

export async function initAgenda() {
   await agenda.start();
}

export async function stopAgenda() {
   await agenda.stop();
}

export async function createRepeatingReminderJob(userId: string, content: string, remindEvery: number) {
   const botId = client.user.id;
   const remindJob = agenda.create('remind', { userId, botId, content });
   await remindJob.repeatEvery(ms(remindEvery, { long: true }), { skipImmediate: true }).save();
}

export async function getJobsById(userId: string) {
   const remindJobs = await agenda.jobs({ name: 'remind' });
   const jobsFound = remindJobs.filter(j => j.attrs.data.userId === userId);
   return jobsFound;
}
