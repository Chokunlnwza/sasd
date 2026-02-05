# Backend Dockerfile
FROM public.ecr.aws/docker/library/node:20-slim

WORKDIR /app

# Copy ทุกอย่างรวมถึง node_modules จากเครื่องคุณเข้าไปเลย
COPY . .

EXPOSE 5000

# รันตรงจากไฟล์ที่ Copy เข้าไป
CMD ["node", "src/index.js"]
