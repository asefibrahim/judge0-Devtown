const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cors = require('cors')
const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json())


// DevTown
// ATW5IZgWabwF0z7L


const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'Unauthorized Access' })
    }
    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.Token, (error, decoded) => {
        if (error) {
            return res.status(402).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded
        next()
    })
}





const uri = `mongodb+srv://${process.env.Db_user}:${process.env.Db_pass}@cluster0.5niozn3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)


        await client.connect();

        const languageCollection = client.db('DevTown').collection('languages')

        const AllLanguageCollection = client.db('DevTown').collection('AllLanguages')
        const statusCollection = client.db('DevTown').collection('statuses')


        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, 'f6583e60-b13b-4228-b554-2eb332ca64e7', {
                expiresIn: '1h'
            })
            res.send({ token })
        })




        app.post('/authenticate', verifyJWT, (req, res) => {
            const authenticationToken = req.headers['x-auth-token']; // Get the authentication token from the request headers
            const token = req.decoded.email
            // Check if the authentication token is valid
            if (authenticationToken === token) {
                res.sendStatus(200); // Authentication token is valid, send a success response
            } else {
                res.sendStatus(401); // Authentication token is invalid, send an unauthorized response
            }
        });

        app.post('/submissions/batch', async (req, res) => {
            try {
                const { submissions } = req.body;
                console.log(submissions);

                // Implement the code to process the batch submissions
                // Iterate over the 'submissions' array and handle each submission individually

                const result = await Promise.all(
                    submissions.map(async (submission) => {

                        const insertedSubmission = await client
                            .db('DevTown')
                            .collection('Info')
                            .insertOne(submission);

                        return { id: insertedSubmission.insertedId };
                    })
                );

                res.status(201).json(result);
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        app.get('/submissions/:token', async (req, res) => {
            try {
                const { token } = req.params;

                // Implement the code to retrieve the submission from the database
                const submission = await client
                    .db('DevTown')
                    .collection('Info')
                    .findOne({ token });

                if (!submission) {
                    return res.status(404).json({ error: 'Submission not found' });
                }

                res.status(200).json(submission);
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        app.get('/submissions', (req, res) => {
            const base64Encoded = req.query.base64_encoded === 'true'; // Check if base64_encoded parameter is set to true
            const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters, defaulting to 1
            const perPage = parseInt(req.query.per_page) || 20; // Get the number of submissions per page, defaulting to 20
            const fields = req.query.fields || 'stdout,time,memory,stderr,token,compile_output,message,status'; // Get the desired fields, defaulting to all fields

            // Perform the logic to retrieve submissions from Judge0
            // Replace the following code with your implementation
            const submissions = [
                {
                    time: '0.001',
                    status: {
                        id: 3,
                        description: 'Accepted'
                    },
                    language: {
                        id: 4,
                        name: 'C (gcc 7.2.0)'
                    }
                },
                {
                    time: '0.001',
                    status: {
                        id: 3,
                        description: 'Accepted'
                    },
                    language: {
                        id: 4,
                        name: 'C (gcc 7.2.0)'
                    }
                }
            ];

            const totalSubmissions = submissions.length;
            const totalPages = Math.ceil(totalSubmissions / perPage);
            const nextPage = page < totalPages ? page + 1 : null;
            const prevPage = page > 1 ? page - 1 : null;

            const response = {
                submissions,
                meta: {
                    current_page: page,
                    next_page: nextPage,
                    prev_page: prevPage,
                    total_pages: totalPages,
                    total_count: totalSubmissions
                }
            };

            if (base64Encoded) {
                // Perform base64 encoding if requested
                // Replace the following code with your implementation
                // ...
            }

            res.json(response); // Send the response as JSON
        });


        app.delete('/submissions/:token', (req, res) => {
            const token = req.params.token; // Get the submission token from the URL parameter
            const fields = req.query.fields || 'stdout,time,memory,stderr,token,compile_output,message,status';

            const deletedSubmission = {
                stdout: 'aGVsbG8sIHdvcmxkCg==\n',
                time: '0.045',
                memory: 8556,
                stderr: null,
                token: 'e80153f5-e7d8-4cd2-9e10-6c0ddbf9e3bf',
                compile_output: null,
                message: null,
                status: {
                    id: 3,
                    description: 'Accepted'
                }
            };

            const response = {};
            for (const field of fields.split(',')) {
                response[field] = deletedSubmission[field];
            }

            res.json(response); // Send the response as JSON
        });


        app.get('/languages', async (req, res) => {


            const result = await languageCollection.find().toArray()
            // Perform the logic to fetch the list of active languages
            // Replace the following code with your implementation

            res.send(result); // Send the response as JSON
        });
        app.get('/languages/all', async (req, res) => {


            const result = await AllLanguageCollection.find().toArray()
            // Perform the logic to fetch the list of active languages
            // Replace the following code with your implementation

            res.send(result); // Send the response as JSON
        });
        app.get('/languages/:id', async (req, res) => {
            const languageId = req.params.id; // Extract the language ID from the URL parameter
            const filter = { _id: new ObjectId(languageId) }
            // Perform the logic to fetch the language details based on the language ID
            // Replace the following code with your implementation
            const language = await languageCollection.insertOne(filter)

            res.send(language); // Send the language details as JSON response
        });

        app.get('/statuses', async (req, res) => {


            const result = await statusCollection.find().toArray()


            res.send(result); // Send the response as JSON
        });



        app.get('/system_info', (req, res) => {
            // Perform the logic to retrieve system information
            // Replace the following code with your implementation
            const systemInfo = {
                Architecture: 'x86_64',
                'CPU op-mode(s)': '32-bit, 64-bit',
                'Byte Order': 'Little Endian',
                'CPU(s)': '4',
                'On-line CPU(s) list': '0-3',
                'Thread(s) per core': '2',
                'Core(s) per socket': '2',
                'Socket(s)': '1',
                'NUMA node(s)': '1',
                'Vendor ID': 'GenuineIntel',
                'CPU family': '6',
                Model: '61',
                'Model name': 'Intel(R) Core(TM) i5-5200U CPU @ 2.20GHz',
                Stepping: '4',
                'CPU MHz': '2508.703',
                'CPU max MHz': '2700.0000',
                'CPU min MHz': '500.0000',
                BogoMIPS: '4392.12',
                Virtualization: 'VT-x',
                'L1d cache': '32K',
                'L1i cache': '32K',
                'L2 cache': '256K',
                'L3 cache': '3072K',
                'NUMA node0 CPU(s)': '0-3',
                Mem: '7.7G',
                Swap: '8.0G',
            };

            res.send(systemInfo); // Send the system information as JSON response
        });

        app.get('/config_info', (req, res) => {
            // Perform the logic to retrieve the configuration information
            // Replace the following code with your implementation
            const configInfo = {
                enable_wait_result: true,
                enable_compiler_options: true,
                allowed_languages_for_compile_options: [],
                enable_command_line_arguments: true,
                enable_submission_delete: false,
                max_queue_size: 100,
                cpu_time_limit: 2,
                max_cpu_time_limit: 15,
                cpu_extra_time: 0.5,
                max_cpu_extra_time: 2,
                wall_time_limit: 5,
                max_wall_time_limit: 20,
                memory_limit: 128000,
                max_memory_limit: 256000,
                stack_limit: 64000,
                max_stack_limit: 128000,
                max_processes_and_or_threads: 60,
                max_max_processes_and_or_threads: 120,
                enable_per_process_and_thread_time_limit: false,
                allow_enable_per_process_and_thread_time_limit: true,
                enable_per_process_and_thread_memory_limit: true,
                allow_enable_per_process_and_thread_memory_limit: true,
                max_file_size: 1024,
                max_max_file_size: 4096,
                number_of_runs: 1,
                max_number_of_runs: 20,
            };

            res.send(configInfo); // Send the configuration information as JSON response
        });




        app.get('/workers', (req, res) => {
            // Perform the logic to retrieve worker information
            // Replace the following code with your implementation
            const workerInfo = [
                {
                    queue: 'default',
                    size: 0,
                    available: 1,
                    idle: 1,
                    working: 0,
                    paused: 0,
                    failed: 0,
                },
            ];

            res.send(workerInfo); // Send the worker information as JSON response
        });




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Server is running......')
})
app.listen(port)