# Frontend Dockerfile
FROM public.ecr.aws/docker/library/node:20-slim

WORKDIR /app

# Copy ทุกอย่างรวมถึง node_modules
COPY . .

EXPOSE 8081 19000 19001 19002

ENV EXPO_OFFLINE=1

# รันตรงจากโฟลเดอร์ bin ใน node_modules
CMD ["./node_modules/.bin/expo", "start", "--web"]
