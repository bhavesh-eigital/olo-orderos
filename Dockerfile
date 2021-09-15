# build stage
FROM node:12.14.0 as builder
# set workdir
WORKDIR /app
# copy all files
COPY . .
# install dependencies
RUN npm install --no-optional
# build for production
RUN npm run build  --aot --prod

# deploy step
FROM nginx:1.14.1-alpine
# get files from previous stage
COPY --from=builder /app/dist/app /usr/share/nginx/html
# configure nginx
COPY .nginx/default.conf /etc/nginx/conf.d/

CMD ["nginx", "-g", "daemon off;"]
